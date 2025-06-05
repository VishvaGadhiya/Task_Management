namespace Task_Management.Shared.DTOs
{
    public class UserTaskDataTableRequest
    {
        public int Draw { get; set; }
        public int Start { get; set; }
        public int Length { get; set; }

        public string? SortColumn { get; set; }
        public string? SortDirection { get; set; }

        public string? SearchValue { get; set; }

        public int? UserId { get; set; }
        public int? TaskId { get; set; }
    }
}
