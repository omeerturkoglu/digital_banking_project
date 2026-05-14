namespace Backend.DTOs.Accounts
{
    public class AccountResponseDto
    {
        public int Id { get; set; }
        public string AccountType { get; set; } = null!;
        public string Currency { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string Iban { get; set; } = null!;
        public decimal Balance { get; set; }
    }
}
