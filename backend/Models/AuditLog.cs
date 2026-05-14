using System;

namespace Backend.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public DateTime LogTimestamp { get; set; } = DateTime.UtcNow;
        public string? Level { get; set; } // INFO, WARNING, ERROR, CRITICAL
        public string Source { get; set; } = null!;
        public string Message { get; set; } = null!;
        public int? UserId { get; set; }
        public string? IpAddress { get; set; }
        public string? Metadata { get; set; } // JSONB mapping

        // Navigation Properties
        public User? User { get; set; }
    }
}
