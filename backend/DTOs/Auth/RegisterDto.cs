namespace Backend.DTOs.Auth
{
    public class RegisterDto
    {
        public string Tckn { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Password { get; set; } = null!;
    }
}
