using Microsoft.EntityFrameworkCore;
using Task_Management.Shared;
using Task_Management.Interfaces.Interfaces;
using TaskManagement.EntityFrameworkCore.Data.Data;
using Task_Management.Shared.DTOs;

namespace Task_Management.Repository.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DataStatusDto> GetTaskStatusSummaryAsync()
        {   
            var tasks = await _context.Tasks.ToListAsync();

            var summaryDto = new DataStatusDto
            {
                ToDo = tasks.Count(t => t.Status == "ToDo"),
                InProgress = tasks.Count(t => t.Status == "InProgress"),
                Completed = tasks.Count(t => t.Status == "Completed")
            };

            return summaryDto;
        }

        public async Task<IEnumerable<Tasks>> GetAllTasksAsync()
        {
            return await _context.Tasks.ToListAsync();
        }

        public async Task<PaginatedResult<CreateOrEditTaskDto>> GetTasksPaginatedAsync(TaskDataTableRequest request)
        {
            var query = _context.Tasks.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchValue))
            {
                query = query.Where(t => t.Title.Contains(request.SearchValue)
                                     || t.Description.Contains(request.SearchValue));
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                query = query.Where(t => t.Status == request.Status);
            }

            if (request.DueDateFrom.HasValue)
            {
                query = query.Where(t => t.DueDate >= request.DueDateFrom.Value);
            }
            if (request.DueDateTo.HasValue)
            {
                query = query.Where(t => t.DueDate <= request.DueDateTo.Value);
            }

            var recordsTotal = await query.CountAsync();

            if (!string.IsNullOrEmpty(request.SortColumn))
            {
                if (request.SortDirection == "asc")
                {
                    query = request.SortColumn switch
                    {
                        "title" => query.OrderBy(t => t.Title),
                        "duedate" => query.OrderBy(t => t.DueDate),
                        "status" => query.OrderBy(t => t.Status),
                        _ => query.OrderBy(t => t.Id),
                    };
                }
                else if (request.SortDirection == "desc")
                {
                    query = request.SortColumn switch
                    {
                        "title" => query.OrderByDescending(t => t.Title),
                        "duedate" => query.OrderByDescending(t => t.DueDate),
                        "status" => query.OrderByDescending(t => t.Status),
                        _ => query.OrderByDescending(t => t.Id),
                    };
                }
            }
            else
            {
                query = query.OrderBy(t => t.Id);
            }

            var data = await query.Skip(request.Start).Take(request.Length).ToListAsync();

            var mappedData = data.Select(t => new CreateOrEditTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Status = t.Status
            }).ToList();

            return new PaginatedResult<CreateOrEditTaskDto>
            {
                Draw = request.Draw,
                RecordsTotal = recordsTotal,
                RecordsFiltered = recordsTotal,
                Data = mappedData
            };
        }

        public async Task<Tasks?> GetTaskByIdAsync(int id)
        {
            return await _context.Tasks.FindAsync(id);
        }

        public async Task<Tasks> AddTaskAsync(CreateOrEditTaskDto dto)
        {
            var task = new Tasks
            {
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                Status = dto.Status ?? "ToDo"
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<Tasks?> UpdateTaskAsync(CreateOrEditTaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(dto.Id);
            if (task == null) return null;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.DueDate = dto.DueDate;
            task.Status = dto.Status ?? task.Status;

            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<bool> DeleteTaskAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
