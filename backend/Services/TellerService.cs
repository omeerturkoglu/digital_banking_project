using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class TellerService : ITellerService
    {
        private readonly BankingDbContext _context;

        public TellerService(BankingDbContext context)
        {
            _context = context;
        }

        public async Task<bool> DepositAsync(int tellerId, string iban, decimal amount, string description)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Iban == iban);
            if (account == null) throw new Exception("Hesap bulunamadı.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                account.Balance += amount;

                var txn = new Transaction
                {
                    TransactionRef = $"DEP-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                    ToAccount = account,
                    Amount = amount,
                    Currency = account.Currency,
                    TransactionType = "NAKIT_YATIRMA",
                    Status = "COMPLETED",
                    Category = "CASH",
                    Description = description ?? "Gise Nakit Yatirma",
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(txn);

                var audit = new AuditLog
                {
                    Level = "INFO",
                    Source = "TellerService",
                    Message = $"Gişe Memuru (ID:{tellerId}) tarafından {iban} hesabına {amount} {account.Currency} yatırıldı.",
                    UserId = tellerId,
                    LogTimestamp = DateTime.UtcNow
                };
                _context.AuditLogs.Add(audit);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> WithdrawAsync(int tellerId, string iban, decimal amount, string description)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Iban == iban);
            if (account == null) throw new Exception("Hesap bulunamadı.");
            if (account.Balance < amount) throw new Exception("Yetersiz bakiye.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                account.Balance -= amount;

                var txn = new Transaction
                {
                    TransactionRef = $"WTH-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                    FromAccount = account,
                    Amount = amount,
                    Currency = account.Currency,
                    TransactionType = "NAKIT_CEKME",
                    Status = "COMPLETED",
                    Category = "CASH",
                    Description = description ?? "Gise Nakit Cekme",
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(txn);

                var audit = new AuditLog
                {
                    Level = "INFO",
                    Source = "TellerService",
                    Message = $"Gişe Memuru (ID:{tellerId}) tarafından {iban} hesabından {amount} {account.Currency} çekildi.",
                    UserId = tellerId,
                    LogTimestamp = DateTime.UtcNow
                };
                _context.AuditLogs.Add(audit);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<int> RegisterCustomerAsync(int tellerId, string tckn, string firstName, string lastName, string email, string phone, string initialPassword)
        {
            var exists = await _context.Users.AnyAsync(u => u.Tckn == tckn);
            if (exists) throw new Exception("Bu TCKN ile kayıtlı bir kullanıcı zaten var.");

            try
            {
                var user = new User
                {
                    Tckn = tckn,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    Phone = phone,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(initialPassword),
                    RoleCode = "CUSTOMER",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Accounts = new List<Account>()
                };

                var accNum = "100" + new Random().Next(10000000, 99999999).ToString();
                var iban = "TR" + new Random().Next(10, 99).ToString() + "000610" + new Random().Next(10000000, 99999999).ToString() + new Random().Next(1000000, 9999999).ToString();

                user.Accounts.Add(new Account
                {
                    AccountType = "VADESIZ_TL",
                    Currency = "TRY",
                    AccountNumber = accNum,
                    Iban = iban,
                    Balance = 0,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                _context.Users.Add(user);
                
                _context.AuditLogs.Add(new AuditLog {
                    Level = "INFO",
                    Source = "TellerService",
                    Message = $"Yeni Müşteri Kaydı: {firstName} {lastName} ({tckn})",
                    LogTimestamp = DateTime.UtcNow
                });

                await _context.SaveChangesAsync(); 
                return user.Id;
            }
            catch (Exception ex)
            {
                throw new Exception($"Veritabanı hatası: {ex.Message}");
            }
        }
    }
}
