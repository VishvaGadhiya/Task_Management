using Task_Management.Shared;
using Task_Management.Shared.DTOs;

namespace Task_Management.Interfaces.Interfaces
{
    public interface IMyTaskService
    {
        Task<IEnumerable<UserTask>> GetTasksByUserIdAsync(int userId);
        Task<PaginatedResult<MyTaskDto>> GetPaginatedTasksByUserAsync(int userId, MyTaskDataTableRequest request);
        Task<bool> UpdateTaskStatusAsync(int taskId, int userId, string newStatus);
    }
}
