using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Task_Management.Shared
{
    public class User : IdentityUser<int>
    {
        public string? Name { get; set; }
        public string? Gender { get; set; }
        public DateTime JoinDate { get; set; }
        public string? Status { get; set; }
        public ICollection<UserTask>? UserTasks { get; set; }
    }
}
