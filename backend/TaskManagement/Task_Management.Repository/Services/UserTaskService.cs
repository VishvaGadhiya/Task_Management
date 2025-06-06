using Microsoft.EntityFrameworkCore;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared;
using Task_Management.Shared.DTOs;
using TaskManagement.EntityFrameworkCore.Data.Data;

namespace Task_Management.Repository.Services
{
    public class UserTaskService : IUserTaskService
    {
        private readonly ApplicationDbContext _context;

        public UserTaskService(ApplicationDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<UserTask>> GetAllAsync()
        {
            return await _context.UserTasks
                .Include(ut => ut.User)
                .Include(ut => ut.Task)
                .ToListAsync();
        }

        public async Task<PaginatedResult<CreateOrEditUserTaskDto>> GetPaginatedAsync(UserTaskDataTableRequest request)
        {
            var query = _context.UserTasks
                .Include(ut => ut.User)
                .Include(ut => ut.Task)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchValue))
            {
                query = query.Where(ut =>
                    ut.User.Name.Contains(request.SearchValue) ||
                    ut.Task.Title.Contains(request.SearchValue));
            }

            if (request.UserId.HasValue)
            {
                query = query.Where(ut => ut.UserId == request.UserId.Value);
            }

            if (request.TaskId.HasValue)
            {
                query = query.Where(ut => ut.TaskId == request.TaskId.Value);
            }

            var recordsTotal = await query.CountAsync();

            if (!string.IsNullOrEmpty(request.SortColumn))
            {
                if (request.SortDirection == "asc")
                {
                    query = request.SortColumn.ToLower() switch
                    {
                        "username" => query.OrderBy(ut => ut.User.Name),
                        "tasktitle" => query.OrderBy(ut => ut.Task.Title),
                        _ => query.OrderBy(ut => ut.Id),
                    };
                }
                else
                {
                    query = request.SortColumn.ToLower() switch
                    {
                        "username" => query.OrderByDescending(ut => ut.User.Name),
                        "tasktitle" => query.OrderByDescending(ut => ut.Task.Title),
                        _ => query.OrderByDescending(ut => ut.Id),
                    };
                }
            }
            else
            {
                query = query.OrderBy(ut => ut.Id);
            }

            var data = await query
                .Skip(request.Start)
                .Take(request.Length)
                .ToListAsync();

            var mappedData = data.Select(ut => new CreateOrEditUserTaskDto
            {
                Id = ut.Id,
                UserId = ut.UserId,
                TaskId = ut.TaskId,
                UserName = ut.User.Name,
                TaskTitle = ut.Task.Title
            }).ToList();

            return new PaginatedResult<CreateOrEditUserTaskDto>
            {
                Draw = request.Draw,
                RecordsTotal = recordsTotal,
                RecordsFiltered = recordsTotal,
                Data = mappedData
            };
        }

        public async Task<UserTask?> GetByIdAsync(int id)
        {
            return await _context.UserTasks
                .Include(ut => ut.User)
                .Include(ut => ut.Task)
                .FirstOrDefaultAsync(ut => ut.Id == id);
        }

        public async Task<UserTask> AddAsync(CreateOrEditUserTaskDto dto)
        {
            var exists = await _context.UserTasks.AnyAsync(ut => ut.UserId == dto.UserId && ut.TaskId == dto.TaskId);
            if (exists)
            {
                throw new InvalidOperationException("This task is already assigned to the user.");
            }

            var userTask = new UserTask
            {
                UserId = dto.UserId,
                TaskId = dto.TaskId
            };

            _context.UserTasks.Add(userTask);
            await _context.SaveChangesAsync();
            return userTask;
        }


        public async Task<UserTask?> UpdateAsync(CreateOrEditUserTaskDto dto)
        {
            var userTask = await _context.UserTasks.FindAsync(dto.Id);
            if (userTask == null) return null;

            var exists = await _context.UserTasks.AnyAsync(ut => ut.Id != dto.Id && ut.UserId == dto.UserId && ut.TaskId == dto.TaskId);
            if (exists)
            {
                throw new InvalidOperationException("This task is already assigned to the user.");
            }

            userTask.UserId = dto.UserId;
            userTask.TaskId = dto.TaskId;

            await _context.SaveChangesAsync();
            return userTask;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var userTask = await _context.UserTasks.FindAsync(id);
            if (userTask == null) return false;

            _context.UserTasks.Remove(userTask);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<User>> GetAllUsersAsync()
        {
            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole == null) return new List<User>();

            var userRoleId = userRole.Id;

            var users = await (from u in _context.Users
                               join ur in _context.UserRoles on u.Id equals ur.UserId
                               where ur.RoleId == userRoleId
                               && u.EmailConfirmed == true    
                               select u).ToListAsync();

            return users;
        }
        public async Task<IEnumerable<Tasks>> GetAllTasksAsync()
        {
            return await _context.Tasks.ToListAsync();
        }

    }
}
