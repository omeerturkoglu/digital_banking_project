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
            Console.WriteLine($"[AUTH-SERVICE] LoginAsync started for TCKN: {loginDto.Tckn}");
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Tckn == loginDto.Tckn);
            
            if (user == null)
            {
                Console.WriteLine("[AUTH-SERVICE] Login failed: User not found.");
                throw new Exception("Geçersiz TCKN veya şifre.");
            }

            Console.WriteLine($"[AUTH-SERVICE] User found. Verifying password for {user.FirstName}...");
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            
            if (!isPasswordValid)
            {
                Console.WriteLine("[AUTH-SERVICE] Login failed: Invalid password.");
                throw new Exception("Geçersiz TCKN veya şifre.");
            }

            if (!user.IsActive)
            {
                Console.WriteLine("[AUTH-SERVICE] Login failed: Account is not active.");
                throw new Exception("Hesabınız henüz Sistem Yöneticisi tarafından onaylanmamıştır. Lütfen bekleyiniz.");
            }

            if (!string.IsNullOrWhiteSpace(loginDto.ExpectedRole) &&
                !string.Equals(user.RoleCode, loginDto.ExpectedRole, StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("[AUTH-SERVICE] Login failed: Role mismatch.");
                throw new Exception("Sectiginiz rol ile kullanici yetkisi eslesmiyor.");
            }

            Console.WriteLine("[AUTH-SERVICE] Login successful. Generating token...");
            return GenerateJwtToken(user);
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            Console.WriteLine($"[AUTH-SERVICE] RegisterAsync started for TCKN: {registerDto.Tckn}");
            if (await _context.Users.AnyAsync(u => u.Tckn == registerDto.Tckn))
            {
                Console.WriteLine("[AUTH-SERVICE] User already exists.");
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
                RoleCode = "CUSTOMER", 
                IsActive = true, // TEST İÇİN: Şimdilik direkt aktif ediyoruz ki giriş yapabilesiniz
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            Console.WriteLine("[AUTH-SERVICE] Adding user to DB...");
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            Console.WriteLine($"[AUTH-SERVICE] User saved. ID: {user.Id}");

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
            
            Console.WriteLine($"[AUTH-SERVICE] Creating account: {account.Iban}");
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
            Console.WriteLine("[AUTH-SERVICE] Saving account and audit log...");
            await _context.SaveChangesAsync();
            Console.WriteLine("[AUTH-SERVICE] Registration complete.");

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            try 
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Tckn == resetPasswordDto.Tckn);
                
                if (user == null) throw new Exception("Gecersiz TCKN veya sifre.");

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(resetPasswordDto.CurrentPassword, user.PasswordHash);
                if (!isPasswordValid) throw new Exception("Gecersiz TCKN veya sifre.");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                
                // Konsolu zorla yazdır
                Console.WriteLine("[DEBUG] VERITABANI KAYDI TAMAMLANDI. CEVAP HAZIRLANIYOR...");
                Console.Out.Flush();

                // Cevabın yola çıkması için çok kısa bir bekleme
                await Task.Delay(200);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] {ex.Message}");
                throw;
            }
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
