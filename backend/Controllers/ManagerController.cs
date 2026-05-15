using Backend.Data;
using Backend.Models;
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

        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var pending = await _context.Users
                .Where(u => !u.IsActive && u.RoleCode == "CUSTOMER")
                .Select(u => new {
                    u.Id,
                    u.Tckn,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Phone,
                    u.CreatedAt
                })
                .ToListAsync();
            return Ok(pending);
        }

        [HttpPost("approve-user/{id}")]
        public async Task<IActionResult> ApproveUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { Message = "Kullanıcı bulunamadı." });

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            var managerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(managerIdClaim, out int managerId);

            var auditLog = new AuditLog
            {
                Level = "INFO",
                Source = "Manager Approval",
                Message = $"Müşteri hesabı onaylandı: {user.FirstName} {user.LastName}",
                UserId = managerId,
                Metadata = $"{{\"target_user_id\": {id}, \"action\": \"UserApproval\"}}"
            };
            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Kullanıcı başarıyla onaylandı." });
        }

        [HttpGet("pending-transfers")]
        public async Task<IActionResult> GetPendingTransfers()
        {
            var pending = await _context.Transactions
                .Include(t => t.FromAccount)
                .ThenInclude(a => a.User)
                .Where(t => t.Status == "PENDING")
                .Select(t => new {
                    t.Id,
                    t.TransactionRef,
                    CustomerName = t.FromAccount != null && t.FromAccount.User != null 
                        ? t.FromAccount.User.FirstName + " " + t.FromAccount.User.LastName 
                        : "Bilinmeyen",
                    t.Amount,
                    t.Currency,
                    t.ToIban,
                    t.CreatedAt
                })
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
