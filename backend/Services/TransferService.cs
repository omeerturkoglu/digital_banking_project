using Backend.Data;
using Backend.DTOs.Transfers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class TransferService : ITransferService
    {
        private readonly BankingDbContext _context;

        public TransferService(BankingDbContext context)
        {
            _context = context;
        }

        public async Task<Transaction> InitiateTransferAsync(int userId, TransferRequestDto requestDto)
        {
            var fromAccount = await _context.Accounts.SingleOrDefaultAsync(a => a.Id == requestDto.FromAccountId && a.UserId == userId);
            
            if (fromAccount == null || !fromAccount.IsActive)
                throw new Exception("Gönderen hesap bulunamadı veya yetkiniz yok.");

            if (fromAccount.Balance < requestDto.Amount)
                throw new Exception("Yetersiz bakiye.");

            // Eğer ToIban girildiyse, sistemde o IBAN'a ait hesap var mı kontrol et
            if (!string.IsNullOrEmpty(requestDto.ToIban))
            {
                var targetAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.Iban == requestDto.ToIban);
                if (targetAccount != null)
                {
                    requestDto.ToAccountId = targetAccount.Id;
                }
            }

            // Calculate commission fee (Simplified logic, ideally should query CommissionRules table)
            decimal fee = requestDto.TransactionType == "EFT" ? 10.0m : 0.0m; // Example fixed fee

            if (fromAccount.Balance < requestDto.Amount + fee)
                throw new Exception("Bakiye komisyon tutarını karşılamıyor.");

            bool requiresApproval = requestDto.Amount >= 5000; // Limit onayı
            string status = requiresApproval ? "PENDING" : "COMPLETED";

            var transaction = new Transaction
            {
                TransactionRef = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                FromAccountId = requestDto.FromAccountId,
                ToAccountId = requestDto.ToAccountId,
                ToIban = requestDto.ToIban,
                Amount = requestDto.Amount,
                Currency = fromAccount.Currency,
                TransactionType = requestDto.TransactionType,
                TransactionFee = fee,
                Status = status,
                Category = requestDto.Category ?? "TRANSFER",
                Description = requestDto.Description,
                RequiresApproval = requiresApproval,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = requiresApproval ? null : DateTime.UtcNow
            };

            // Deduct balance only if no approval required (per user request)
            if (!requiresApproval)
            {
                fromAccount.Balance -= (requestDto.Amount + fee);

                // Add to recipient if internal
                if (requestDto.ToAccountId.HasValue)
                {
                    var toAccount = await _context.Accounts.FindAsync(requestDto.ToAccountId);
                    if (toAccount != null)
                    {
                        toAccount.Balance += requestDto.Amount;
                    }
                }
            }

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }

        public async Task<bool> ApproveTransferAsync(int transactionId, int managerId)
        {
            var txn = await _context.Transactions.FindAsync(transactionId);
            if (txn == null || txn.Status != "PENDING")
                throw new Exception("İşlem bulunamadı veya onay bekleyen durumda değil.");

            txn.Status = "COMPLETED";
            txn.CompletedAt = DateTime.UtcNow;
            txn.ApprovedById = managerId;

            // Sender hesabını bulup bakiyeyi şimdi düşüyoruz
            if (txn.FromAccountId.HasValue)
            {
                var fromAccount = await _context.Accounts.FindAsync(txn.FromAccountId);
                if (fromAccount != null)
                {
                    fromAccount.Balance -= (txn.Amount + txn.TransactionFee);
                }
            }

            // Add to recipient if internal
            if (txn.ToAccountId.HasValue)
            {
                var toAccount = await _context.Accounts.FindAsync(txn.ToAccountId);
                if (toAccount != null)
                {
                    toAccount.Balance += txn.Amount;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectTransferAsync(int transactionId, int managerId)
        {
            var txn = await _context.Transactions.FindAsync(transactionId);
            if (txn == null || txn.Status != "PENDING")
                throw new Exception("İşlem bulunamadı veya onay bekleyen durumda değil.");

            txn.Status = "REJECTED";
            txn.ApprovedById = managerId;
            txn.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
