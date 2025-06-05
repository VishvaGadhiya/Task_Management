using System.ComponentModel.DataAnnotations;

namespace Task_Management.Shared.DTOs
{
    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
