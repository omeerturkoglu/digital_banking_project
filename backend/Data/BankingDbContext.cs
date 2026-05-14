using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class BankingDbContext : DbContext
    {
        public BankingDbContext(DbContextOptions<BankingDbContext> options) : base(options)
        {
        }

        public DbSet<Branch> Branches { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Account> Accounts { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<CommissionRule> CommissionRules { get; set; } = null!;
        public DbSet<ExchangeRate> ExchangeRates { get; set; } = null!;
        public DbSet<ExchangeRateHistory> ExchangeRateHistories { get; set; } = null!;
        public DbSet<BudgetCategory> BudgetCategories { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table mapping to lowercase as per Postgres conventions
            modelBuilder.Entity<Branch>().ToTable("branches");
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Account>().ToTable("accounts");
            modelBuilder.Entity<Transaction>().ToTable("transactions");
            modelBuilder.Entity<CommissionRule>().ToTable("commission_rules");
            modelBuilder.Entity<ExchangeRate>().ToTable("exchange_rates");
            modelBuilder.Entity<ExchangeRateHistory>().ToTable("exchange_rate_history");
            modelBuilder.Entity<BudgetCategory>().ToTable("budget_categories");
            modelBuilder.Entity<PasswordResetToken>().ToTable("password_reset_tokens");
            modelBuilder.Entity<AuditLog>().ToTable("audit_logs");

            // Branch mappings
            modelBuilder.Entity<Branch>().Property(b => b.Id).HasColumnName("id");
            modelBuilder.Entity<Branch>().Property(b => b.BranchCode).HasColumnName("branch_code");
            modelBuilder.Entity<Branch>().Property(b => b.BranchName).HasColumnName("branch_name");
            modelBuilder.Entity<Branch>().Property(b => b.City).HasColumnName("city");
            modelBuilder.Entity<Branch>().Property(b => b.Address).HasColumnName("address");
            modelBuilder.Entity<Branch>().Property(b => b.IsActive).HasColumnName("is_active");
            modelBuilder.Entity<Branch>().Property(b => b.CreatedAt).HasColumnName("created_at");

            // User mappings
            modelBuilder.Entity<User>().HasIndex(u => u.Tckn).IsUnique();
            modelBuilder.Entity<User>().Property(u => u.Id).HasColumnName("id");
            modelBuilder.Entity<User>().Property(u => u.Tckn).HasColumnName("tckn");
            modelBuilder.Entity<User>().Property(u => u.FirstName).HasColumnName("first_name");
            modelBuilder.Entity<User>().Property(u => u.LastName).HasColumnName("last_name");
            modelBuilder.Entity<User>().Property(u => u.Email).HasColumnName("email");
            modelBuilder.Entity<User>().Property(u => u.Phone).HasColumnName("phone");
            modelBuilder.Entity<User>().Property(u => u.PasswordHash).HasColumnName("password_hash");
            modelBuilder.Entity<User>().Property(u => u.RoleCode).HasColumnName("role_code");
            modelBuilder.Entity<User>().Property(u => u.BranchId).HasColumnName("branch_id");
            modelBuilder.Entity<User>().Property(u => u.IsActive).HasColumnName("is_active");
            modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasColumnName("created_at");
            modelBuilder.Entity<User>().Property(u => u.UpdatedAt).HasColumnName("updated_at");

            modelBuilder.Entity<User>()
                .HasOne(u => u.Branch)
                .WithMany(b => b.Users)
                .HasForeignKey(u => u.BranchId)
                .OnDelete(DeleteBehavior.SetNull);

            // Account mappings
            modelBuilder.Entity<Account>().HasIndex(a => a.AccountNumber).IsUnique();
            modelBuilder.Entity<Account>().HasIndex(a => a.Iban).IsUnique();
            modelBuilder.Entity<Account>().Property(a => a.Id).HasColumnName("id");
            modelBuilder.Entity<Account>().Property(a => a.UserId).HasColumnName("user_id");
            modelBuilder.Entity<Account>().Property(a => a.AccountType).HasColumnName("account_type");
            modelBuilder.Entity<Account>().Property(a => a.Currency).HasColumnName("currency");
            modelBuilder.Entity<Account>().Property(a => a.AccountNumber).HasColumnName("account_number");
            modelBuilder.Entity<Account>().Property(a => a.Iban).HasColumnName("iban");
            modelBuilder.Entity<Account>().Property(a => a.Balance).HasColumnName("balance");
            modelBuilder.Entity<Account>().Property(a => a.IsActive).HasColumnName("is_active");
            modelBuilder.Entity<Account>().Property(a => a.CreatedAt).HasColumnName("created_at");

            modelBuilder.Entity<Account>()
                .HasOne(a => a.User)
                .WithMany(u => u.Accounts)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Transaction mappings
            modelBuilder.Entity<Transaction>().HasIndex(t => t.TransactionRef).IsUnique();
            modelBuilder.Entity<Transaction>().Property(t => t.Id).HasColumnName("id");
            modelBuilder.Entity<Transaction>().Property(t => t.TransactionRef).HasColumnName("transaction_ref");
            modelBuilder.Entity<Transaction>().Property(t => t.FromAccountId).HasColumnName("from_account_id");
            modelBuilder.Entity<Transaction>().Property(t => t.ToAccountId).HasColumnName("to_account_id");
            modelBuilder.Entity<Transaction>().Property(t => t.ToIban).HasColumnName("to_iban");
            modelBuilder.Entity<Transaction>().Property(t => t.Amount).HasColumnName("amount");
            modelBuilder.Entity<Transaction>().Property(t => t.Currency).HasColumnName("currency");
            modelBuilder.Entity<Transaction>().Property(t => t.TransactionType).HasColumnName("transaction_type");
            modelBuilder.Entity<Transaction>().Property(t => t.TransactionFee).HasColumnName("transaction_fee");
            modelBuilder.Entity<Transaction>().Property(t => t.ExchangeRate).HasColumnName("exchange_rate");
            modelBuilder.Entity<Transaction>().Property(t => t.Status).HasColumnName("status");
            modelBuilder.Entity<Transaction>().Property(t => t.Category).HasColumnName("category");
            modelBuilder.Entity<Transaction>().Property(t => t.MerchantName).HasColumnName("merchant_name");
            modelBuilder.Entity<Transaction>().Property(t => t.Description).HasColumnName("description");
            modelBuilder.Entity<Transaction>().Property(t => t.RequiresApproval).HasColumnName("requires_approval");
            modelBuilder.Entity<Transaction>().Property(t => t.ApprovedById).HasColumnName("approved_by");
            modelBuilder.Entity<Transaction>().Property(t => t.CreatedAt).HasColumnName("created_at");
            modelBuilder.Entity<Transaction>().Property(t => t.CompletedAt).HasColumnName("completed_at");

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.FromAccount)
                .WithMany(a => a.TransactionsFrom)
                .HasForeignKey(t => t.FromAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.ToAccount)
                .WithMany(a => a.TransactionsTo)
                .HasForeignKey(t => t.ToAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.ApprovedBy)
                .WithMany()
                .HasForeignKey(t => t.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            // CommissionRule mappings
            modelBuilder.Entity<CommissionRule>().Property(c => c.Id).HasColumnName("id");
            modelBuilder.Entity<CommissionRule>().Property(c => c.RuleName).HasColumnName("rule_name");
            modelBuilder.Entity<CommissionRule>().Property(c => c.TransactionType).HasColumnName("transaction_type");
            modelBuilder.Entity<CommissionRule>().Property(c => c.Currency).HasColumnName("currency");
            modelBuilder.Entity<CommissionRule>().Property(c => c.FixedAmount).HasColumnName("fixed_amount");
            modelBuilder.Entity<CommissionRule>().Property(c => c.PercentageRate).HasColumnName("percentage_rate");
            modelBuilder.Entity<CommissionRule>().Property(c => c.MinAmount).HasColumnName("min_amount");
            modelBuilder.Entity<CommissionRule>().Property(c => c.IsActive).HasColumnName("is_active");
            modelBuilder.Entity<CommissionRule>().Property(c => c.UpdatedById).HasColumnName("updated_by");
            modelBuilder.Entity<CommissionRule>().Property(c => c.CreatedAt).HasColumnName("created_at");
            modelBuilder.Entity<CommissionRule>().Property(c => c.UpdatedAt).HasColumnName("updated_at");

            modelBuilder.Entity<CommissionRule>()
                .HasOne(c => c.UpdatedBy)
                .WithMany()
                .HasForeignKey(c => c.UpdatedById)
                .OnDelete(DeleteBehavior.SetNull);

            // ExchangeRate mappings
            modelBuilder.Entity<ExchangeRate>().HasIndex(e => e.CurrencyCode).IsUnique();
            modelBuilder.Entity<ExchangeRate>().Property(e => e.Id).HasColumnName("id");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.CurrencyCode).HasColumnName("currency_code");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.CurrencyName).HasColumnName("currency_name");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.BuyRate).HasColumnName("buy_rate");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.SellRate).HasColumnName("sell_rate");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.Trend).HasColumnName("trend");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.Source).HasColumnName("source");
            modelBuilder.Entity<ExchangeRate>().Property(e => e.UpdatedAt).HasColumnName("updated_at");

            // ExchangeRateHistory mappings
            modelBuilder.Entity<ExchangeRateHistory>().Property(e => e.Id).HasColumnName("id");
            modelBuilder.Entity<ExchangeRateHistory>().Property(e => e.CurrencyCode).HasColumnName("currency_code");
            modelBuilder.Entity<ExchangeRateHistory>().Property(e => e.BuyRate).HasColumnName("buy_rate");
            modelBuilder.Entity<ExchangeRateHistory>().Property(e => e.SellRate).HasColumnName("sell_rate");
            modelBuilder.Entity<ExchangeRateHistory>().Property(e => e.Source).HasColumnName("source");
            modelBuilder.Entity<ExchangeRateHistory>().Property(e => e.RecordedAt).HasColumnName("recorded_at");

            // BudgetCategory mappings
            modelBuilder.Entity<BudgetCategory>().Property(b => b.Id).HasColumnName("id");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.UserId).HasColumnName("user_id");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.CategoryName).HasColumnName("category_name");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.MonthlyLimit).HasColumnName("monthly_limit");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.YearlyLimit).HasColumnName("yearly_limit");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.Period).HasColumnName("period");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.ColorCode).HasColumnName("color_code");
            modelBuilder.Entity<BudgetCategory>().Property(b => b.CreatedAt).HasColumnName("created_at");

            modelBuilder.Entity<BudgetCategory>()
                .HasOne(b => b.User)
                .WithMany(u => u.BudgetCategories)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // PasswordResetToken mappings
            modelBuilder.Entity<PasswordResetToken>().HasIndex(p => p.Token).IsUnique();
            modelBuilder.Entity<PasswordResetToken>().Property(p => p.Id).HasColumnName("id");
            modelBuilder.Entity<PasswordResetToken>().Property(p => p.UserId).HasColumnName("user_id");
            modelBuilder.Entity<PasswordResetToken>().Property(p => p.Token).HasColumnName("token");
            modelBuilder.Entity<PasswordResetToken>().Property(p => p.ExpiresAt).HasColumnName("expires_at");
            modelBuilder.Entity<PasswordResetToken>().Property(p => p.IsUsed).HasColumnName("is_used");
            modelBuilder.Entity<PasswordResetToken>().Property(p => p.CreatedAt).HasColumnName("created_at");

            modelBuilder.Entity<PasswordResetToken>()
                .HasOne(p => p.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // AuditLog mappings
            modelBuilder.Entity<AuditLog>().Property(a => a.Id).HasColumnName("id");
            modelBuilder.Entity<AuditLog>().Property(a => a.LogTimestamp).HasColumnName("log_timestamp");
            modelBuilder.Entity<AuditLog>().Property(a => a.Level).HasColumnName("level");
            modelBuilder.Entity<AuditLog>().Property(a => a.Source).HasColumnName("source");
            modelBuilder.Entity<AuditLog>().Property(a => a.Message).HasColumnName("message");
            modelBuilder.Entity<AuditLog>().Property(a => a.UserId).HasColumnName("user_id");
            modelBuilder.Entity<AuditLog>().Property(a => a.IpAddress).HasColumnName("ip_address");
            modelBuilder.Entity<AuditLog>().Property(a => a.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
