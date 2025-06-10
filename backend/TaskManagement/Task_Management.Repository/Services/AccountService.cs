using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web;

using Task_Management.Interfaces.Interfaces;
using Task_Management.Repository.Helpers;
using Task_Management.Shared;
using Task_Management.Shared.DTOs;

namespace Task_Management.Repository.Services
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly EmailSender _emailSender;
        private readonly ILogger _logger;

        public AccountService(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration, ILogger<AccountService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailSender = new EmailSender();
            _logger = logger;
        }

        public async Task<IdentityResult> RegisterUserAsync(RegisterViewModel model)
        {
            string profileImagePath = null;

            if (model.ProfileImage != null && model.ProfileImage.Length > 0)
            {
                // Define folder path (adjust as needed)
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "users");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Generate unique file name
                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(model.ProfileImage.FileName);

                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save the file to server
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ProfileImage.CopyToAsync(fileStream);
                }

                // Store relative path to save in DB
                profileImagePath = Path.Combine("uploads", "users", uniqueFileName).Replace("\\", "/");
            }

            var user = new User
            {
                UserName = model.UserName,
                Email = model.Email,
                Name = model.Name,
                Gender = model.Gender,
                JoinDate = model.JoinDate,
                Status = "Active",
                ProfileImagePath = profileImagePath  // Save image path
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

                var confirmationLink = $"https://localhost:7125/api/Account/confirm-email?userId={user.Id}&token={encodedToken}";

                var subject = "Confirm your email";
                var message = $"<p>Please confirm your account by clicking the link below:</p><p><a href='{confirmationLink}'>Confirm Email</a></p>";

                await _emailSender.SendEmailAsync(user.Email, subject, message);
            }

            return result;
        }



       public async Task<string> LoginUserAsync(LoginViewModel model)
{
    var user = await _userManager.FindByNameAsync(model.UserName);
    if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
        return null;

    if (!await _userManager.IsEmailConfirmedAsync(user) || user.Status != "Active")
        return null;

    var roles = await _userManager.GetRolesAsync(user);

    var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        
        new Claim("profileImageUrl", user.ProfileImagePath ?? string.Empty)
    };

    authClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

    var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));

    var token = new JwtSecurityToken(
        issuer: _configuration["JwtSettings:Issuer"],
        audience: _configuration["JwtSettings:Audience"],
        expires: DateTime.UtcNow.AddHours(1),
        claims: authClaims,
        signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}


        public async Task<IdentityResult> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return IdentityResult.Failed();

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
            return await _userManager.ConfirmEmailAsync(user, decodedToken);
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    _logger.LogWarning("Email is empty.");
                    return false;
                }

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning("User not found with email: {Email}", email);
                    return false;
                }

                if (!user.EmailConfirmed)
                {
                    _logger.LogWarning("Email not confirmed for user: {Email}", email);
                    return false;
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var resetUrl = $"{_configuration["ClientUrl"]}/reset-password?token={HttpUtility.UrlEncode(token)}&email={HttpUtility.UrlEncode(email)}";

                await _emailSender.SendEmailAsync(email, "Reset Password",
        $@"Please reset your password by clicking the link below:<br/><br/>
<a href='{resetUrl}'>Click to reset your password</a><br/><br/>
If the above link doesn't work, copy and paste this into your browser:<br/>
{resetUrl.Replace("&", "&amp;")}");

                _logger.LogInformation("Password reset email sent to: {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ForgotPasswordAsync");
                return false;
            }
        }


        public async Task<bool> ResetPasswordAsync(ResetPasswordViewModel model)
        {
            try
            {
                if (model == null)
                    return false;

                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                    return false;

                var result = await _userManager.ResetPasswordAsync(user, model.Token, model.Password);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<UserProfileViewModel> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileViewModel
            {
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Gender = user.Gender,
                JoinDate = user.JoinDate,
                Status = user.Status
            };
        }

        public async Task<bool> UpdateUserProfileAsync(string userId, UpdateProfileViewModel model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.Name = model.Name;
            user.Gender = model.Gender;

            if (model.ProfileImage != null && model.ProfileImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(model.ProfileImage.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ProfileImage.CopyToAsync(stream);
                }

                // Optional: delete old image if you want
                if (!string.IsNullOrEmpty(user.ProfileImagePath))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfileImagePath.TrimStart('/'));
                    if (File.Exists(oldPath))
                        File.Delete(oldPath);
                }

                user.ProfileImagePath = $"/uploads/profiles/{fileName}";
            }

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }


        public async Task<IdentityResult> ChangePasswordAsync(string userId, ChangePasswordViewModel model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return IdentityResult.Failed(new IdentityError { Description = "User not found." });

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            return result;
        }

        public async Task<(bool Succeeded, string? ConfirmationUrl, IEnumerable<string> Errors)> ChangeEmailAsync(string userId, ChangeEmailViewModel model, HttpRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, null, new[] { "User not found" });

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!isPasswordValid)
                return (false, null, new[] { "Incorrect password" });

            var existing = await _userManager.FindByEmailAsync(model.NewEmail);
            if (existing != null && existing.Id != user.Id)
                return (false, null, new[] { "Email is already in use" });

            var token = await _userManager.GenerateChangeEmailTokenAsync(user, model.NewEmail);
            var confirmationUrl = $"{request.Scheme}://{request.Host}/api/account/confirm-change-email?userId={userId}&newEmail={model.NewEmail}&token={Uri.EscapeDataString(token)}";

            var emailBody = $@"
        <h4>Email Change Request</h4>
        <p>You requested to change your email. Click the link below to confirm:</p>
        <p><a href='{confirmationUrl}'>Confirm Email Change</a></p>";

            await _emailSender.SendEmailAsync(model.NewEmail, "Confirm Your New Email", emailBody);

            return (true, confirmationUrl, Enumerable.Empty<string>());
        }
        public async Task<(bool Succeeded, IEnumerable<string> Errors)> ConfirmChangeEmailAsync(string userId, string newEmail, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, new[] { "User not found" });

            var result = await _userManager.ChangeEmailAsync(user, newEmail, token);
            return result.Succeeded
                ? (true, Enumerable.Empty<string>())
                : (false, result.Errors.Select(e => e.Description));
        }


        public async Task LogoutUserAsync()
        {
            await _signInManager.SignOutAsync();
        }


    }

}
