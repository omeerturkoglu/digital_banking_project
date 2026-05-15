namespace Backend.DTOs.Teller
{
    public class CashOperationDto
    {
        public string Iban { get; set; } = null!;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class CustomerRegistrationDto
    {
        public string Tckn { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Password { get; set; } = null!;
    }
}
