using System;

namespace Backend.DTOs.Accounts
{
    public class AccountTransactionDto
    {
        public int Id { get; set; }
        public string TransactionRef { get; set; } = null!;
        public string TransactionType { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal Amount { get; set; }
        public decimal TransactionFee { get; set; }
        public string Currency { get; set; } = null!;
        public string Direction { get; set; } = null!;
        public string Summary { get; set; } = null!;
        public string AccountIban { get; set; } = null!;
        public string? CounterpartyIban { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
