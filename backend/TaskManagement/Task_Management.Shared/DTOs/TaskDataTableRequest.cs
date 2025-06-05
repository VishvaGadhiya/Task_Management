namespace Task_Management.Shared.DTOs
{
    public class TaskDataTableRequest
    {
        public int Draw { get; set; }
        public int Start { get; set; }  // Offset for pagination
        public int Length { get; set; } // Number of records per page

        // Sorting
        public string? SortColumn { get; set; }
        public string? SortDirection { get; set; }  // "asc" or "desc"

        // Searching
        public string? SearchValue { get; set; }

        // Filtering (optional fields you want)
        public string? Status { get; set; }
        public DateTime? DueDateFrom { get; set; }
        public DateTime? DueDateTo { get; set; }
    }

}
