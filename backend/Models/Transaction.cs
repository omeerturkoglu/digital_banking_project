using System;

namespace Backend.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public string TransactionRef { get; set; } = null!;
        public int? FromAccountId { get; set; }
        public int? ToAccountId { get; set; }
        public string? ToIban { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = null!;
        public string TransactionType { get; set; } = null!; // HAVALE, EFT, DOVIZ_ALIM, vb.
        public decimal TransactionFee { get; set; } = 0;
        public decimal? ExchangeRate { get; set; }
        public string Status { get; set; } = null!; // PENDING, APPROVED, REJECTED, COMPLETED
        public string? Category { get; set; }
        public string? MerchantName { get; set; }
        public string? Description { get; set; }
        public bool RequiresApproval { get; set; } = false;
        public int? ApprovedById { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Navigation Properties
        public Account? FromAccount { get; set; }
        public Account? ToAccount { get; set; }
        public User? ApprovedBy { get; set; }
    }
}
