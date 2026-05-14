using Backend.DTOs.Accounts;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IAccountService
    {
        Task<List<AccountResponseDto>> GetMyWalletsAsync(int userId);
        Task<string> GenerateIbanAsync(string currency);
        Task<string> GenerateAccountNumberAsync();
    }
}
