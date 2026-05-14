using System;

namespace Backend.Models
{
    public class CommissionRule
    {
        public int Id { get; set; }
        public string RuleName { get; set; } = null!;
        public string TransactionType { get; set; } = null!;
        public string Currency { get; set; } = "TRY";
        public decimal FixedAmount { get; set; } = 0;
        public decimal PercentageRate { get; set; } = 0;
        public decimal MinAmount { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public int? UpdatedById { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User? UpdatedBy { get; set; }
    }
}
