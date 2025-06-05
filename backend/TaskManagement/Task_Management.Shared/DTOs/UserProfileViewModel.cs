
namespace Task_Management.Shared.DTOs
{
    public class UserProfileViewModel
    {
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Gender { get; set; }
        public DateTime JoinDate { get; set; }
        public string Status { get; set; }
    }

    public class UpdateProfileViewModel
    {
        public string Name { get; set; }
        public string Gender { get; set; }
    }

    public class ChangePasswordViewModel
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }

}
