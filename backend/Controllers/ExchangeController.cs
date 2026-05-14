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

        public ExchangeController(IRedisCacheService redisCacheService)
        {
            _redisCacheService = redisCacheService;
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
    }
}
