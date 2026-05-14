using System;

namespace Backend.Models
{
    public class ExchangeRate
    {
        public int Id { get; set; }
        public string CurrencyCode { get; set; } = null!; // USD, EUR, GBP, XAU
        public string CurrencyName { get; set; } = null!;
        public decimal BuyRate { get; set; }
        public decimal SellRate { get; set; }
        public string? Trend { get; set; } // up, down, stable
        public string Source { get; set; } = "MANUAL"; // TCMB, MANUAL
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
