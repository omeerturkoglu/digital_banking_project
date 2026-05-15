using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ExchangeController : ControllerBase
    {
        private readonly IRedisCacheService _redisCacheService;
        private readonly IExchangeService _exchangeService;

        public ExchangeController(IRedisCacheService redisCacheService, IExchangeService exchangeService)
        {
            _redisCacheService = redisCacheService;
            _exchangeService = exchangeService;
        }

        [HttpGet("live-rates")]
        public async Task<IActionResult> GetLiveRates()
        {
            var rates = await _redisCacheService.GetAsync<Dictionary<string, object>>("rates:live");
            if (rates == null)
            {
                return NotFound(new { Message = "Kurlar henüz güncellenmedi." });
            }
            return Ok(rates);
        }

        [HttpPost("execute")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> ExecuteExchange([FromBody] Backend.DTOs.Exchange.ExchangeRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId)) return Unauthorized();

                var result = await _exchangeService.ExecuteExchangeAsync(userId, request);
                return Ok(new { Message = "İşlem başarıyla tamamlandı.", Success = true });
            }
            catch (System.Exception ex)
            {
                var fullMessage = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { Message = fullMessage, Success = false });
            }
        }
    }
}
