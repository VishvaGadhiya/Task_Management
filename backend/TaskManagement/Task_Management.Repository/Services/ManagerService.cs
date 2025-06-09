using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared;
using Task_Management.Shared.DTOs;
using TaskManagement.EntityFrameworkCore.Data.Data;


namespace Task_Management.Repository.Services
{
    public class ManagerService : IManagerService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public ManagerService(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IEnumerable<ManagerViewModel>> GetAllAsync()
        {
            var managers = await _userManager.GetUsersInRoleAsync("Manager");

            return managers.Select(m => new ManagerViewModel
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Gender = m.Gender,
                JoinDate = m.JoinDate,
                Status = m.Status,
                ProfileImagePath = m.ProfileImagePath 

            });
        }

        public async Task<ManagerViewModel?> GetByIdAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return null;

            if (!await _userManager.IsInRoleAsync(user, "Manager")) return null;

            return new ManagerViewModel
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Gender = user.Gender,
                JoinDate = user.JoinDate,
                Status = user.Status,
                ProfileImagePath = user.ProfileImagePath 

            };
        }

        public async Task<PaginatedResult<ManagerViewModel>> GetPaginatedAsync(ManagerDataTableRequest request)
        {
            var query = _userManager.Users.AsQueryable();

            var managerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Manager");
            if (managerRole == null)
                return new PaginatedResult<ManagerViewModel> { Data = new List<ManagerViewModel>(), RecordsTotal = 0, RecordsFiltered = 0, Draw = request.Draw };

            var managerRoleId = managerRole.Id;

            var managersQuery = from user in _context.Users
                                join ur in _context.UserRoles on user.Id equals ur.UserId
                                where ur.RoleId == managerRoleId
                                select user;

            if (!string.IsNullOrEmpty(request.SearchValue))
            {
                var searchTerm = request.SearchValue.ToLower();
                managersQuery = managersQuery.Where(u =>
                    u.Name.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm) ||
                    u.Gender.ToLower().Contains(searchTerm) ||
                    u.Status.ToLower().Contains(searchTerm) ||
                    u.JoinDate.ToString("yyyy-MM-dd").Contains(searchTerm)
                );
            }

            if (!string.IsNullOrEmpty(request.Gender) && request.Gender != "All")
            {
                managersQuery = managersQuery.Where(u => u.Gender == request.Gender);
            }

            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                managersQuery = managersQuery.Where(u => u.Status == request.Status);
            }

            var recordsTotal = await managersQuery.CountAsync();

            if (!string.IsNullOrEmpty(request.SortColumn) && !string.IsNullOrEmpty(request.SortDirection))
            {
                var sortDirection = request.SortDirection.ToLower() == "desc" ? " descending" : "";
                managersQuery = managersQuery.OrderBy($"{request.SortColumn}{sortDirection}");
            }
            else
            {
                managersQuery = managersQuery.OrderByDescending(u => u.JoinDate);
            }

            var data = await managersQuery
                .Skip(request.Start)
                .Take(request.Length)
                .ToListAsync();

            var mappedData = data.Select(m => new ManagerViewModel
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Gender = m.Gender,
                JoinDate = m.JoinDate,
                Status = m.Status,
                ProfileImagePath = m.ProfileImagePath
            }).ToList();

            return new PaginatedResult<ManagerViewModel>
            {
                Draw = request.Draw,
                RecordsTotal = recordsTotal,
                RecordsFiltered = recordsTotal,
                Data = mappedData
            };
        }
        public async Task<ManagerViewModel> CreateAsync(ManagerViewModel manager)
        {
            var imagePath = await SaveProfileImageAsync(manager.ProfileImage);

            var user = new User
            {
                UserName = manager.Email,
                Email = manager.Email,
                Name = manager.Name,
                Gender = manager.Gender,
                JoinDate = manager.JoinDate,
                Status = manager.Status,
                ProfileImagePath = imagePath,
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await _userManager.CreateAsync(user, manager.Password ?? "DefaultPassword@123");
            if (!result.Succeeded)
            {
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, "Manager");

            manager.Id = user.Id;
            manager.Password = null;
            manager.ConfirmPassword = null;
            manager.ProfileImagePath = imagePath;

            return manager;
        }


        public async Task<bool> UpdateAsync(int id, ManagerViewModel manager)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || !await _userManager.IsInRoleAsync(user, "Manager"))
                return false;

            user.Name = manager.Name;
            user.Email = manager.Email;
            user.UserName = manager.Email;
            user.Gender = manager.Gender;
            user.JoinDate = manager.JoinDate;
            user.Status = manager.Status;

            if (manager.ProfileImage != null)
            {
                var imagePath = await SaveProfileImageAsync(manager.ProfileImage);
                user.ProfileImagePath = imagePath;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return false;

            if (!string.IsNullOrEmpty(manager.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passResult = await _userManager.ResetPasswordAsync(user, token, manager.Password);
                if (!passResult.Succeeded) return false;
            }

            return true;
        }
        private async Task<string?> SaveProfileImageAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "managers");
            Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/managers/{fileName}";
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return false;

            if (!await _userManager.IsInRoleAsync(user, "Manager")) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }


    }
}
