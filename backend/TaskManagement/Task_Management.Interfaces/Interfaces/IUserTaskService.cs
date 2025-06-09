using Task_Management.Shared;
using Task_Management.Shared.DTOs;

namespace Task_Management.Interfaces.Interfaces
{
    public interface IUserTaskService
    {
        Task<DataStatusDto> GetUserTaskStatusSummaryAsync();

        Task<List<User>> GetAllUsersAsync();
        Task<IEnumerable<Tasks>> GetAllTasksAsync();
        Task<IEnumerable<UserTask>> GetAllAsync();
        Task<PaginatedResult<CreateOrEditUserTaskDto>> GetPaginatedAsync(UserTaskDataTableRequest request);
        Task<UserTask?> GetByIdAsync(int id);
        Task<UserTask> AddAsync(CreateOrEditUserTaskDto dto);
        Task<UserTask?> UpdateAsync(CreateOrEditUserTaskDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
