
using Task_Management.Shared.DTOs;

namespace Task_Management.Interfaces.Interfaces
{
    public interface IManagerService
    {
        Task<DataStatisticsDto> GetManagerStatisticsAsync();
        Task<IEnumerable<ManagerViewModel>> GetAllAsync();
        Task<PaginatedResult<ManagerViewModel>> GetPaginatedAsync(ManagerDataTableRequest request);  
        Task<ManagerViewModel?> GetByIdAsync(int id);
        Task<ManagerViewModel> CreateAsync(ManagerViewModel manager);
        Task<bool> UpdateAsync(int id, ManagerViewModel manager);
        Task<bool> DeleteAsync(int id);
    }
}
