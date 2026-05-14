using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Branch
    {
        public int Id { get; set; }
        public string BranchCode { get; set; } = null!;
        public string BranchName { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
