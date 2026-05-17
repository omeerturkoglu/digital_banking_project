namespace Backend.DTOs.Accounts
{
    public class CreateAccountDto
    {
        public string AccountType { get; set; } = "VADESIZ_TL";
        public string Currency { get; set; } = "TRY";
    }
}
