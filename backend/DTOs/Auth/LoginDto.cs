namespace Backend.DTOs.Auth
{
    public class LoginDto
    {
        public string Tckn { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
