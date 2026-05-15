using System.Threading.Tasks;

namespace Backend.Services
{
    public interface ITellerService
    {
        Task<bool> DepositAsync(int tellerId, string iban, decimal amount, string description);
        Task<bool> WithdrawAsync(int tellerId, string iban, decimal amount, string description);
        Task<int> RegisterCustomerAsync(int tellerId, string tckn, string firstName, string lastName, string email, string phone, string initialPassword);
    }
}
