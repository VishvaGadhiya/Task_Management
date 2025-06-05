using Task_Management.Shared;
using Task_Management.Shared.DTOs;

namespace Task_Management.Interfaces.Interfaces
{
    public interface ITaskService
    {
        Task<IEnumerable<Tasks>> GetAllTasksAsync();
        Task<PaginatedResult<CreateOrEditTaskDto>> GetTasksPaginatedAsync(TaskDataTableRequest request);
        Task<Tasks?> GetTaskByIdAsync(int id);
        Task<Tasks> AddTaskAsync(CreateOrEditTaskDto dto);
        Task<Tasks?> UpdateTaskAsync(CreateOrEditTaskDto dto);
        Task<bool> DeleteTaskAsync(int id);
    }
}
