using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared;
using Task_Management.Shared.DTOs;
using TaskManagement.EntityFrameworkCore.Data.Data;

namespace Task_Management.Repository.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole == null) return new List<User>();

            var userRoleId = userRole.Id;

            var users = await (from u in _context.Users
                               join ur in _context.UserRoles on u.Id equals ur.UserId
                               where ur.RoleId == userRoleId
                               select u).ToListAsync();

            return users;
        }

        public async Task<PaginatedResult<User>> GetUsersPaginatedAsync(UserDataTableRequest request)
        {
            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole == null)
                return new PaginatedResult<User> { Data = new List<User>() };

            var userRoleId = userRole.Id;

            var query = from u in _context.Users
                        join ur in _context.UserRoles on u.Id equals ur.UserId
                        where ur.RoleId == userRoleId
                        select u;

            if (!string.IsNullOrEmpty(request.SearchValue))
            {
                var searchTerm = request.SearchValue.ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(searchTerm) ||
                    u.Gender.ToLower().Contains(searchTerm) ||
                    u.Status.ToLower().Contains(searchTerm) ||
                    u.JoinDate.ToString().Contains(searchTerm));
            }

            if (!string.IsNullOrEmpty(request.Gender) && request.Gender != "All")
            {
                query = query.Where(u => u.Gender == request.Gender);
            }

            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                query = query.Where(u => u.Status == request.Status);
            }

            var recordsTotal = await query.CountAsync();

            if (!string.IsNullOrEmpty(request.SortColumn) && !string.IsNullOrEmpty(request.SortDirection))
            {
                var sortDirection = request.SortDirection == "desc" ? " descending" : "";
                query = query.OrderBy($"{request.SortColumn}{sortDirection}");
            }
            else
            {
                query = query.OrderByDescending(u => u.JoinDate);
            }

            var data = await query
                .Skip(request.Start)
                .Take(request.Length)
                .ToListAsync();

            return new PaginatedResult<User>
            {
                Draw = request.Draw,
                RecordsTotal = recordsTotal,
                RecordsFiltered = recordsTotal, 
                Data = data
            };
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<bool> CreateUserAsync(CreateOrEditUserDto dto)
        {
            if (await UserExistsAsync(dto.Name, dto.Gender))
                return false;

            var user = new User
            {
                Name = dto.Name,
                Gender = dto.Gender,
                JoinDate = dto.JoinDate,
                Status = dto.Status
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserAsync(CreateOrEditUserDto dto)
        {
            if (await UserExistsAsync(dto.Name, dto.Gender, dto.Id))
                return false;

            var user = await GetUserByIdAsync(dto.Id);
            if (user == null) return false;

            user.Name = dto.Name;
            user.Gender = dto.Gender;
            user.JoinDate = dto.JoinDate;
            user.Status = dto.Status;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            var userTasks = await _context.UserTasks
                .Include(ut => ut.Task)
                .Where(ut => ut.UserId == id)
                .ToListAsync();

            if (userTasks.Any(ut => ut.Task.Status != "Completed"))
            {
                return false; 
            }

            _context.UserTasks.RemoveRange(userTasks);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> UserExistsAsync(string name, string gender, int? excludeId = null)
        {
            return await _context.Users.AnyAsync(u =>
                u.Name == name && u.Gender == gender && (!excludeId.HasValue || u.Id != excludeId.Value));
        }
    }
}
