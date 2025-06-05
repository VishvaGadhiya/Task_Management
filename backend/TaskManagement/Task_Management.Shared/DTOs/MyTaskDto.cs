namespace Task_Management.Shared.DTOs
{
    public class MyTaskDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }       // <-- Add this line

        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DueDate { get; set; }
        public string? Status { get; set; }
    }
}
