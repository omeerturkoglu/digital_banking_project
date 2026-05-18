using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet("my-wallets")]
        public async Task<IActionResult> GetMyWallets()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                var accounts = await _accountService.GetMyWalletsAsync(userId);
                return Ok(accounts);
            }
            return Unauthorized();
        }

        [HttpGet("my-transactions")]
        public async Task<IActionResult> GetMyTransactions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                var transactions = await _accountService.GetMyTransactionsAsync(userId);
                return Ok(transactions);
            }
            return Unauthorized();
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAccount([FromBody] Backend.DTOs.Accounts.CreateAccountDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                var result = await _accountService.CreateAccountAsync(userId, dto.AccountType, dto.Currency);
                if (result) return Ok(new { Message = "Yeni hesap başarıyla oluşturuldu." });
                return BadRequest(new { Message = "Hesap oluşturulurken bir hata oluştu." });
            }
            return Unauthorized();
        }
    }
}
