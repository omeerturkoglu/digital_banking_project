namespace Backend.DTOs.Transfers
{
    public class TransferRequestDto
    {
        public int FromAccountId { get; set; }
        public int? ToAccountId { get; set; }
        public string? ToIban { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; } = null!; // HAVALE or EFT
        public string? Category { get; set; }
        public string? Description { get; set; }
    }
}
