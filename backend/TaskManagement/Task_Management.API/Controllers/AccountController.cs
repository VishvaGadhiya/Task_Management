using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared.DTOs;

namespace Task_Management.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("register")]
        [DisableRequestSizeLimit] // optional: to control max upload size
        public async Task<IActionResult> Register([FromForm] RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _accountService.RegisterUserAsync(model);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    ModelState.AddModelError(error.Code, error.Description);
                return BadRequest(ModelState);
            }

            return Ok(new { Message = "Registration successful. Please confirm your email." });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var token = await _accountService.LoginUserAsync(model);
            if (token == null)
                return Unauthorized(new { Message = "Invalid login attempt." });

            return Ok(new { Token = token });
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("Invalid email confirmation link.");

            var result = await _accountService.ConfirmEmailAsync(userId, token);

            if (result.Succeeded)
            {
                return Redirect("http://localhost:4200/login"); 
            }

            return BadRequest("Email confirmation failed.");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordViewModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email))
                return BadRequest("Invalid email request.");

            var result = await _accountService.ForgotPasswordAsync(model.Email);
            if (!result)
                return BadRequest("Password reset email could not be sent. Make sure the email exists and is confirmed.");

            return Ok("Password reset email sent.");
        }


        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model)
        {
            try
            {
                if (model == null)
                {
                    return BadRequest("Request body cannot be null.");
                }

                var success = await _accountService.ResetPasswordAsync(model);

                if (!success)
                {
                    return BadRequest("Password reset failed.");
                }

                return Ok(new { Message = "Password reset successful." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _accountService.LogoutUserAsync();
            return Ok(new { Message = "Logged out successfully." });
        }

        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _accountService.GetUserProfileAsync(userId);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileViewModel model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var success = await _accountService.UpdateUserProfileAsync(userId, model);
            if (!success)
                return BadRequest("Profile update failed");

            return Ok(new { Message = "Profile updated successfully" });
        }
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _accountService.ChangePasswordAsync(userId, model);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(new { Message = "Password change failed", Errors = errors });
            }

            return Ok(new { Message = "Password changed successfully" });
        }



    }
}
