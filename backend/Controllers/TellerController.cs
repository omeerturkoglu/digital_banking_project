using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "TELLER")]
    public class TellerController : ControllerBase
    {
        private readonly BankingDbContext _context;

        public TellerController(BankingDbContext context)
        {
            _context = context;
        }

        [HttpPost("cash-deposit")]
        public async Task<IActionResult> CashDeposit(int accountId, decimal amount)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null) return NotFound("Hesap bulunamadı.");

            account.Balance += amount;
            
            var txn = new Transaction
            {
                TransactionRef = $"DEP-{Guid.NewGuid().ToString().Substring(0,8)}",
                ToAccountId = accountId,
                Amount = amount,
                Currency = account.Currency,
                TransactionType = "NAKIT_YATIRMA",
                Status = "COMPLETED",
                CompletedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(txn);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Para yatırma işlemi başarılı." });
        }
    }
}
