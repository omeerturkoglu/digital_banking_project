using Backend.Data;
using Backend.DTOs.Exchange;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class ExchangeService : IExchangeService
    {
        private readonly BankingDbContext _context;

        public ExchangeService(BankingDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ExecuteExchangeAsync(int userId, ExchangeRequestDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Get Accounts
                var fromAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.Currency == request.FromCurrency);
                
                if (fromAccount == null)
                    throw new Exception($"{request.FromCurrency} hesabı bulunamadı.");

                var toAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.Currency == request.ToCurrency);

                // 2. Auto-create account if it doesn't exist
                if (toAccount == null)
                {
                    toAccount = await CreateCurrencyAccountAsync(userId, request.ToCurrency);
                }

                // 3. Get Exchange Rate
                string rateCode = request.OperationType == "BUY" ? request.ToCurrency : request.FromCurrency;
                var exchangeRate = await _context.ExchangeRates.FirstOrDefaultAsync(r => r.CurrencyCode == rateCode);
                
                if (exchangeRate == null)
                    throw new Exception($"{rateCode} için kur bilgisi bulunamadı.");

                decimal rate = request.OperationType == "BUY" ? exchangeRate.SellRate : exchangeRate.BuyRate;
                decimal sourceAmount;
                decimal targetAmount;

                if (request.OperationType == "BUY") // TRY -> USD
                {
                    // request.Amount is how much USD user wants to BUY
                    targetAmount = request.Amount;
                    sourceAmount = targetAmount * rate;
                }
                else // USD -> TRY
                {
                    // request.Amount is how much USD user wants to SELL
                    sourceAmount = request.Amount;
                    targetAmount = sourceAmount * rate;
                }

                // 4. Check Balance
                if (fromAccount.Balance < sourceAmount)
                    throw new Exception("Yetersiz bakiye.");

                // 5. Update Balances
                fromAccount.Balance -= sourceAmount;
                toAccount.Balance += targetAmount;

                // 6. Record Transaction
                var txn = new Transaction
                {
                    TransactionRef = $"EXC-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                    FromAccount = fromAccount,
                    ToAccount = toAccount,
                    Amount = request.OperationType == "BUY" ? targetAmount : sourceAmount, 
                    Currency = request.OperationType == "BUY" ? request.ToCurrency : request.FromCurrency,
                    TransactionType = request.OperationType == "BUY" ? "DOVIZ_ALIM" : "DOVIZ_SATIM",
                    ExchangeRate = rate,
                    Status = "COMPLETED",
                    Category = "INVESTMENT",
                    Description = $"{request.OperationType}: {sourceAmount} {request.FromCurrency} -> {targetAmount} {request.ToCurrency}",
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(txn);

                // 7. Audit Log
                var audit = new AuditLog
                {
                    Level = "INFO",
                    Source = "ExchangeService",
                    Message = $"{userId} ID'li kullanıcı döviz işlemi yaptı: {txn.Description}",
                    UserId = userId,
                    Metadata = JsonSerializer.Serialize(new
                    {
                        type = request.OperationType,
                        from = request.FromCurrency,
                        to = request.ToCurrency,
                        amount = request.Amount,
                        rate = rate
                    })
                };
                _context.AuditLogs.Add(audit);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<Account> CreateCurrencyAccountAsync(int userId, string currency)
        {
            var randomAcc = "100" + new Random().Next(10000000, 99999999).ToString();
            var randomIban = "TR" + new Random().Next(10, 99).ToString() + "000610" + new Random().Next(10000000, 99999999).ToString() + new Random().Next(1000000, 9999999).ToString();

            var account = new Account
            {
                UserId = userId,
                AccountType = "VADESIZ_DOVIZ",
                Currency = currency,
                AccountNumber = randomAcc,
                Iban = randomIban,
                Balance = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            return account;
        }
    }
}
