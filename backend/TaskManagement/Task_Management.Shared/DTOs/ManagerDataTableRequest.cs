namespace Task_Management.Shared.DTOs
{
    public class ManagerDataTableRequest
    {
        public int Draw { get; set; }
        public int Start { get; set; }
        public int Length { get; set; }

        public string? SortColumn { get; set; }
        public string? SortDirection { get; set; }

        public string? SearchValue { get; set; }

        // Additional filters (optional)
        public string? Gender { get; set; }
        public string? Status { get; set; }
    }
}
