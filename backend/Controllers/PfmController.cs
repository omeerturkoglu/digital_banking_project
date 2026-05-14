using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/reports")]
    [Authorize]
    public class PfmController : ControllerBase
    {
        private readonly IPfmService _pfmService;

        public PfmController(IPfmService pfmService)
        {
            _pfmService = pfmService;
        }

        [HttpGet("monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary([FromQuery] int year, [FromQuery] int month)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                var summary = await _pfmService.GetMonthlyExpenseSummaryAsync(userId, year, month);
                return Ok(summary);
            }
            return Unauthorized();
        }
    }
}
