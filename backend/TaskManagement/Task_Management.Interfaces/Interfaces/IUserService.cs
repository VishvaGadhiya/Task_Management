using Task_Management.Shared;
using Task_Management.Shared.DTOs;

namespace Task_Management.Interfaces.Interfaces
{
    public interface IUserService
    {

        Task<List<User>> GetAllUsersAsync();
        Task<PaginatedResult<User>> GetUsersPaginatedAsync(UserDataTableRequest request);
        Task<User> GetUserByIdAsync(int id);
        Task<bool> CreateUserAsync(CreateOrEditUserDto dto);
        Task<bool> UpdateUserAsync(CreateOrEditUserDto dto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> UserExistsAsync(string name, string gender, int? excludeId = null);
    }
}
