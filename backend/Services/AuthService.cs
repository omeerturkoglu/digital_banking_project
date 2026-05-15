using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly BankingDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(BankingDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Tckn == loginDto.Tckn);
            
            if (user == null)
            {
                throw new Exception("Geçersiz TCKN veya şifre.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                throw new Exception("Geçersiz TCKN veya şifre.");
            }

            if (!user.IsActive)
            {
                throw new Exception("Hesabınız henüz Sistem Yöneticisi tarafından onaylanmamıştır. Lütfen bekleyiniz.");
            }

            return GenerateJwtToken(user);
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Tckn == registerDto.Tckn))
            {
                throw new Exception("Bu TCKN ile kayıtlı bir kullanıcı zaten var.");
            }

            var user = new User
            {
                Tckn = registerDto.Tckn,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                Phone = registerDto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                RoleCode = "CUSTOMER", // Varsayılan rol
                IsActive = false, // Yeni kayıtlar artık varsayılan olarak "Onay Bekliyor"
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Otomatik IBAN ve Bakiye Tanımlaması
            var random = new Random();
            var account = new Account
            {
                UserId = user.Id,
                AccountType = "VADESIZ_TL",
                Currency = "TRY",
                AccountNumber = "100" + random.Next(10000000, 99999999).ToString(),
                Iban = "TR" + random.Next(10, 99).ToString() + "000610" + random.Next(10000000, 99999999).ToString() + random.Next(1000000, 9999999).ToString(),
                Balance = 10000.00m,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Accounts.Add(account);

            var auditLog = new AuditLog
            {
                Level = "INFO",
                Source = "Auth Service",
                Message = $"Sisteme yeni bir Müşteri kayıt oldu ve onay bekliyor: {user.FirstName} {user.LastName}. (IBAN: {account.Iban})",
                UserId = user.Id,
                Metadata = $"{{\"tckn\": \"{user.Tckn}\", \"action\": \"UserRegistration_Pending\"}}"
            };
            
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var tokenEntity = await _context.PasswordResetTokens
                .Include(p => p.User)
                .SingleOrDefaultAsync(p => p.Token == resetPasswordDto.Token && !p.IsUsed);

            if (tokenEntity == null || tokenEntity.ExpiresAt < DateTime.UtcNow)
            {
                throw new Exception("Geçersiz veya süresi dolmuş token.");
            }

            var user = tokenEntity.User;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            tokenEntity.IsUsed = true;

            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "super_secret_key_needs_to_be_long_enough");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.RoleCode)
            };

            if (user.BranchId.HasValue)
            {
                claims.Add(new Claim("BranchId", user.BranchId.Value.ToString()));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpireMinutes"] ?? "60")),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
