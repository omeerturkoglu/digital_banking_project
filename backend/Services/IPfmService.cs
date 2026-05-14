using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IPfmService
    {
        Task<Dictionary<string, decimal>> GetMonthlyExpenseSummaryAsync(int userId, int year, int month);
    }
}
