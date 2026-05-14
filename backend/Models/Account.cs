using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Account
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string AccountType { get; set; } = null!; // VADESIZ_TL, VADESIZ_DOVIZ
        public string Currency { get; set; } = null!; // TRY, USD, EUR, GBP
        public string AccountNumber { get; set; } = null!;
        public string Iban { get; set; } = null!;
        public decimal Balance { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; } = null!;
        public ICollection<Transaction> TransactionsFrom { get; set; } = new List<Transaction>();
        public ICollection<Transaction> TransactionsTo { get; set; } = new List<Transaction>();
    }
}
