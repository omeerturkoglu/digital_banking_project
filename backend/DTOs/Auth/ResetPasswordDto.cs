namespace Backend.DTOs.Auth
{
    public class ResetPasswordDto
    {
        public string Tckn { get; set; } = null!;
        public string CurrentPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
