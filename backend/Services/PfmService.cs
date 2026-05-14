using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class PfmService : IPfmService
    {
        private readonly BankingDbContext _context;

        public PfmService(BankingDbContext context)
        {
            _context = context;
        }

        public async Task<Dictionary<string, decimal>> GetMonthlyExpenseSummaryAsync(int userId, int year, int month)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);

            // Fetch outgoing transactions for this user's accounts in the given month
            var expenses = await _context.Transactions
                .Include(t => t.FromAccount)
                .Where(t => t.FromAccount != null && t.FromAccount.UserId == userId 
                            && t.Status == "COMPLETED" 
                            && t.CreatedAt >= startDate && t.CreatedAt < endDate)
                .GroupBy(t => t.Category ?? "DİĞER")
                .Select(g => new { Category = g.Key, Total = g.Sum(t => t.Amount) })
                .ToDictionaryAsync(x => x.Category, x => x.Total);

            return expenses;
        }
    }
}
