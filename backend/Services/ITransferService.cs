using Backend.DTOs.Transfers;
using Backend.Models;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface ITransferService
    {
        Task<Transaction> InitiateTransferAsync(int userId, TransferRequestDto requestDto);
        Task<bool> ApproveTransferAsync(int transactionId, int managerId);
        Task<bool> RejectTransferAsync(int transactionId, int managerId);
    }
}
