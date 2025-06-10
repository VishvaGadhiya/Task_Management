using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Task_Management.Shared.DTOs;

namespace Task_Management.Interfaces.Interfaces
{
    public interface IAccountService
    {
        Task<IdentityResult> RegisterUserAsync(RegisterViewModel model);
        Task<string> LoginUserAsync(LoginViewModel model);
        Task<IdentityResult> ConfirmEmailAsync(string userId, string token);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordViewModel model);

        Task<UserProfileViewModel> GetUserProfileAsync(string userId);

        Task<bool> UpdateUserProfileAsync(string userId, UpdateProfileViewModel model);
        Task<IdentityResult> ChangePasswordAsync(string userId, ChangePasswordViewModel model);
        Task<(bool Succeeded, string? ConfirmationUrl, IEnumerable<string> Errors)> ChangeEmailAsync(string userId, ChangeEmailViewModel model, HttpRequest request);
        Task<(bool Succeeded, IEnumerable<string> Errors)> ConfirmChangeEmailAsync(string userId, string newEmail, string token);

        Task LogoutUserAsync();
    }
}
