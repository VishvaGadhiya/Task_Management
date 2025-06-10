using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Task_Management.Shared.DTOs
{
    public class ChangeEmailViewModel
    {
        public string NewEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

}
