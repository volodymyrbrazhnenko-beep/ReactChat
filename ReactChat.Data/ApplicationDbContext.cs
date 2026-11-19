using Microsoft.EntityFrameworkCore;
using ReactChat.Domain;

namespace ReactChat.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Customer> Customers { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
    }
}
