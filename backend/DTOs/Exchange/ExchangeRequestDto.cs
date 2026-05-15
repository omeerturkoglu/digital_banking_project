namespace Backend.DTOs.Exchange
{
    public class ExchangeRequestDto
    {
        public string FromCurrency { get; set; } = "TRY";
        public string ToCurrency { get; set; } = null!;
        public decimal Amount { get; set; } // The amount in FromCurrency or ToCurrency? Let's say Amount is what user wants to SPEND or BUY. 
        public string OperationType { get; set; } = null!; // BUY or SELL
    }
}
