using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json.Serialization;

namespace Task_Management.Shared.DTOs
{
    public class CreateOrEditUserDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string? Gender { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime JoinDate { get; set; }

        [Required]
        public string Status { get; set; }
    }
}
