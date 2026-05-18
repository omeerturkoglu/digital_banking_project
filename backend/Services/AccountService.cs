using Backend.Data;
using Backend.DTOs.Accounts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class AccountService : IAccountService
    {
        private readonly BankingDbContext _context;

        public AccountService(BankingDbContext context)
        {
            _context = context;
        }

        public async Task<List<AccountResponseDto>> GetMyWalletsAsync(int userId)
        {
            var accounts = await _context.Accounts
                .Where(a => a.UserId == userId && a.IsActive)
                .Select(a => new AccountResponseDto
                {
                    Id = a.Id,
                    AccountType = a.AccountType,
                    Currency = a.Currency,
                    AccountNumber = a.AccountNumber,
                    Iban = a.Iban,
                    Balance = a.Balance
                })
                .ToListAsync();

            return accounts;
        }

        public async Task<List<AccountTransactionDto>> GetMyTransactionsAsync(int userId)
        {
            var transactions = await _context.Transactions
                .AsNoTracking()
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .Where(t =>
                    (t.FromAccount != null && t.FromAccount.UserId == userId) ||
                    (t.ToAccount != null && t.ToAccount.UserId == userId))
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return transactions.Select(t => new AccountTransactionDto
            {
                Id = t.Id,
                TransactionRef = t.TransactionRef,
                TransactionType = t.TransactionType,
                Status = t.Status,
                Amount = t.Amount,
                TransactionFee = t.TransactionFee,
                Currency = t.Currency,
                Direction = ResolveDirection(t, userId),
                Summary = ResolveSummary(t, userId),
                AccountIban = ResolveAccountIban(t, userId),
                CounterpartyIban = ResolveCounterpartyIban(t, userId),
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            }).ToList();
        }

        public async Task<bool> CreateAccountAsync(int userId, string accountType, string currency)
        {
            var account = new Backend.Models.Account
            {
                UserId = userId,
                AccountType = accountType,
                Currency = currency,
                AccountNumber = await GenerateAccountNumberAsync(),
                Iban = await GenerateIbanAsync(currency),
                Balance = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> GenerateAccountNumberAsync()
        {
            string newAccountNumber;
            bool exists;
            do
            {
                // Format: NVB-12345678
                newAccountNumber = $"NVB-{new Random().Next(10000000, 99999999)}";
                exists = await _context.Accounts.AnyAsync(a => a.AccountNumber == newAccountNumber);
            } while (exists);

            return newAccountNumber;
        }

        public async Task<string> GenerateIbanAsync(string currency)
        {
            string newIban;
            bool exists;
            do
            {
                // Format: TR99 0006 2000 0001 2345 6789 00
                string randomPart = "";
                for (int i = 0; i < 16; i++)
                {
                    randomPart += new Random().Next(0, 10).ToString();
                }
                newIban = $"TR9900062000{randomPart}";
                exists = await _context.Accounts.AnyAsync(a => a.Iban == newIban);
            } while (exists);

            return newIban;
        }

        private static string ResolveDirection(Backend.Models.Transaction transaction, int userId)
        {
            bool fromMe = transaction.FromAccount?.UserId == userId;
            bool toMe = transaction.ToAccount?.UserId == userId;

            if (transaction.TransactionType == "DOVIZ_ALIM" || transaction.TransactionType == "DOVIZ_SATIM")
                return "EXCHANGE";

            if (fromMe && toMe)
                return "INTERNAL";

            if (fromMe)
                return "OUT";

            if (toMe)
                return "IN";

            return "INFO";
        }

        private static string ResolveSummary(Backend.Models.Transaction transaction, int userId)
        {
            if (!string.IsNullOrWhiteSpace(transaction.Description))
                return transaction.Description;

            bool fromMe = transaction.FromAccount?.UserId == userId;
            bool toMe = transaction.ToAccount?.UserId == userId;

            if (transaction.TransactionType == "DOVIZ_ALIM")
                return "Doviz alim islemi";

            if (transaction.TransactionType == "DOVIZ_SATIM")
                return "Doviz satim islemi";

            if (transaction.TransactionType == "NAKIT_YATIRMA")
                return "Nakit yatirma";

            if (transaction.TransactionType == "NAKIT_CEKME")
                return "Nakit cekme";

            if (fromMe && toMe)
                return "Kendi hesaplariniz arasinda transfer";

            if (fromMe)
                return "Giden transfer";

            if (toMe)
                return "Gelen transfer";

            return "Hesap hareketi";
        }

        private static string ResolveAccountIban(Backend.Models.Transaction transaction, int userId)
        {
            if (transaction.FromAccount?.UserId == userId)
                return transaction.FromAccount.Iban;

            if (transaction.ToAccount?.UserId == userId)
                return transaction.ToAccount.Iban;

            return "-";
        }

        private static string? ResolveCounterpartyIban(Backend.Models.Transaction transaction, int userId)
        {
            bool fromMe = transaction.FromAccount?.UserId == userId;
            bool toMe = transaction.ToAccount?.UserId == userId;

            if (transaction.TransactionType == "DOVIZ_ALIM" || transaction.TransactionType == "DOVIZ_SATIM")
            {
                if (transaction.FromAccount != null && transaction.ToAccount != null)
                    return $"{transaction.FromAccount.Iban} -> {transaction.ToAccount.Iban}";
            }

            if (fromMe && transaction.ToAccount != null)
                return transaction.ToAccount.Iban;

            if (fromMe && !string.IsNullOrWhiteSpace(transaction.ToIban))
                return transaction.ToIban;

            if (toMe && transaction.FromAccount != null)
                return transaction.FromAccount.Iban;

            return null;
        }
    }
}
