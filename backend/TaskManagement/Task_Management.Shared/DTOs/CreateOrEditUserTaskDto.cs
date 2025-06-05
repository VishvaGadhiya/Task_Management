namespace Task_Management.Shared.DTOs
{
    public class CreateOrEditUserTaskDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }

        public int TaskId { get; set; }
        public string? TaskTitle { get; set; }

    }
}
