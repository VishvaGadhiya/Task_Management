using System.ComponentModel.DataAnnotations;

namespace Task_Management.Shared.DTOs
{
    public class CreateOrEditTaskDto
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DueDate { get; set; }

        public string? Status { get; set; }
    }
}
