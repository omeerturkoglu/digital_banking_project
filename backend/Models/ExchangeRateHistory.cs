using System;

namespace Backend.Models
{
    public class ExchangeRateHistory
    {
        public int Id { get; set; }
        public string CurrencyCode { get; set; } = null!;
        public decimal BuyRate { get; set; }
        public decimal SellRate { get; set; }
        public string Source { get; set; } = "TCMB";
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    }
}
