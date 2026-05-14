using System;

namespace Backend.Models
{
    public class BudgetCategory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CategoryName { get; set; } = null!;
        public decimal? MonthlyLimit { get; set; }
        public decimal? YearlyLimit { get; set; }
        public string Period { get; set; } = null!; // MONTHLY, YEARLY
        public string? ColorCode { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; } = null!;
    }
}
