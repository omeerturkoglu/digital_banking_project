using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "MANAGER")]
    public class ManagerController : ControllerBase
    {
        private readonly BankingDbContext _context;
        private readonly ITransferService _transferService;

        public ManagerController(BankingDbContext context, ITransferService transferService)
        {
            _context = context;
            _transferService = transferService;
        }

        [HttpGet("pending-transfers")]
        public async Task<IActionResult> GetPendingTransfers()
        {
            // ideally filter by manager's branch
            var pending = await _context.Transactions
                .Where(t => t.Status == "PENDING")
                .ToListAsync();
            return Ok(pending);
        }

        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveTransfer(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int managerId)) return Unauthorized();

                await _transferService.ApproveTransferAsync(id, managerId);
                return Ok(new { Message = "İşlem onaylandı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectTransfer(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int managerId)) return Unauthorized();

                await _transferService.RejectTransferAsync(id, managerId);
                return Ok(new { Message = "İşlem reddedildi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
