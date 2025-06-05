using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq.Dynamic.Core;
using Task_Management.Shared;
using Task_Management.Interfaces.Interfaces;
using TaskManagement.EntityFrameworkCore.Data.Data;
using Task_Management.Shared.DTOs;



namespace Task_Management.Repository.Services
{
    public class MyTaskService : IMyTaskService
    {
        private readonly ApplicationDbContext _context;

        public MyTaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserTask>> GetTasksByUserIdAsync(int userId)
        {
            return await _context.UserTasks
                .Include(ut => ut.Task)
                .Where(ut => ut.UserId == userId)
                .ToListAsync();
        }

        public async Task<PaginatedResult<MyTaskDto>> GetPaginatedTasksByUserAsync(int userId, MyTaskDataTableRequest request)
        {
            var query = _context.UserTasks
                .Include(ut => ut.Task)
                .Where(ut => ut.UserId == userId);

            if (!string.IsNullOrEmpty(request.SearchValue))
            {
                var search = request.SearchValue.ToLower();
                query = query.Where(ut =>
                    ut.Task.Title.ToLower().Contains(search) ||
                    ut.Task.Description.ToLower().Contains(search) ||
                    ut.Task.Status.ToLower().Contains(search) ||
                    ut.Task.DueDate.ToString().Contains(search));
            }

            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                query = query.Where(ut => ut.Task.Status == request.Status);
            }

            var recordsTotal = await query.CountAsync();

            if (!string.IsNullOrEmpty(request.SortColumn) && !string.IsNullOrEmpty(request.SortDirection))
            {
                var direction = request.SortDirection == "desc" ? " descending" : "";
                query = query.OrderBy($"Task.{request.SortColumn}{direction}");
            }
            else
            {
                query = query.OrderByDescending(ut => ut.Task.DueDate);
            }

            var userTasks = await query
                .Skip(request.Start)
                .Take(request.Length)
                .ToListAsync();

            var mappedData = userTasks.Select(ut => new MyTaskDto
            {
                Id = ut.Id,
                TaskId = ut.TaskId,
                Title = ut.Task.Title,
                Description = ut.Task.Description,
                DueDate = ut.Task.DueDate.ToString("yyyy-MM-dd"),
                Status = ut.Task.Status
            }).ToList();

            return new PaginatedResult<MyTaskDto>
            {
                Draw = request.Draw,
                RecordsTotal = recordsTotal,
                RecordsFiltered = recordsTotal,
                Data = mappedData
            };
        }


        public async Task<bool> UpdateTaskStatusAsync(int taskId, int userId, string newStatus)
        {
            var userTask = await _context.UserTasks
                .Include(ut => ut.Task)
                .FirstOrDefaultAsync(ut => ut.TaskId == taskId && ut.UserId == userId);

            if (userTask == null || userTask.Task == null)
                return false;

            userTask.Task.Status = newStatus;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
