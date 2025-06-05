namespace Task_Management.Shared.DTOs
{
    public class UserDataTableRequest
    {
        public int Draw { get; set; }
        public int Start { get; set; } // Starting record number (for pagination)
        public int Length { get; set; } // Number of records per page

        // Sorting
        public string? SortColumn { get; set; }
        public string? SortDirection { get; set; } // "asc" or "desc"

        // Searching
        public string? SearchValue { get; set; }

        // Filtering
        public string? Gender { get; set; }
        public string? Status { get; set; }
    }

}
