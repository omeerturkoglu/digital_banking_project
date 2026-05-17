using Backend.DTOs.Accounts;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IAccountService
    {
        Task<List<AccountResponseDto>> GetMyWalletsAsync(int userId);
        Task<bool> CreateAccountAsync(int userId, string accountType, string currency);
        Task<string> GenerateIbanAsync(string currency);
        Task<string> GenerateAccountNumberAsync();
    }
}
