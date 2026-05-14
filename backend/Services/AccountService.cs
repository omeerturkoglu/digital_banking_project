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
    }
}
