using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly BankingDbContext _context;

        public AdminController(BankingDbContext context)
        {
            _context = context;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _context.AuditLogs.AsNoTracking().ToListAsync();
            return Ok(logs);
        }

        [HttpGet("commission-rules")]
        public async Task<IActionResult> GetCommissionRules()
        {
            var rules = await _context.CommissionRules.AsNoTracking().ToListAsync();
            return Ok(rules);
        }
    }
}
