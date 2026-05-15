using Backend.DTOs.Exchange;
using Backend.Models;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IExchangeService
    {
        Task<bool> ExecuteExchangeAsync(int userId, ExchangeRequestDto request);
    }
}
