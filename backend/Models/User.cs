using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Tckn { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string PasswordHash { get; set; } = null!;
        public string RoleCode { get; set; } = null!; // CUSTOMER, ADMIN, MANAGER, TELLER
        public int? BranchId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Branch? Branch { get; set; }
        public ICollection<Account> Accounts { get; set; } = new List<Account>();
        public ICollection<BudgetCategory> BudgetCategories { get; set; } = new List<BudgetCategory>();
        public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
