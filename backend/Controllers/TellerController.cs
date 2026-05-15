using Backend.DTOs.Teller;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "TELLER,MANAGER,ADMIN")]
    public class TellerController : ControllerBase
    {
        private readonly ITellerService _tellerService;

        public TellerController(ITellerService tellerService)
        {
            _tellerService = tellerService;
        }

        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit([FromBody] CashOperationDto dto)
        {
            try
            {
                var tellerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _tellerService.DepositAsync(tellerId, dto.Iban, dto.Amount, dto.Description);
                return Ok(new { Success = true, Message = "Para yatırma işlemi başarıyla tamamlandı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> Withdraw([FromBody] CashOperationDto dto)
        {
            try
            {
                var tellerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _tellerService.WithdrawAsync(tellerId, dto.Iban, dto.Amount, dto.Description);
                return Ok(new { Success = true, Message = "Para çekme işlemi başarıyla tamamlandı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("register-customer")]
        public async Task<IActionResult> RegisterCustomer([FromBody] CustomerRegistrationDto dto)
        {
            try
            {
                var tellerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var customerId = await _tellerService.RegisterCustomerAsync(tellerId, dto.Tckn, dto.FirstName, dto.LastName, dto.Email, dto.Phone, dto.Password);
                
                return Ok(new { Success = true, Message = "Yeni müşteri kaydı başarıyla oluşturuldu.", CustomerId = customerId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }
    }
}
