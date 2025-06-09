using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Task_Management.Shared.DTOs
{
    public class DataStatusDto
    {
        public int ToDo { get; set; }
        public int InProgress { get; set; }
        public int Completed { get; set; }
    }
}
