using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ReactChat.Data
{
    public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var connectionString = GetConnectionString();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(connectionString)
                .Options;

            return new ApplicationDbContext(options);
        }

        private static string GetConnectionString()
        {
            var currentDirectory = Directory.GetCurrentDirectory();
            var settingsFiles = new[]
            {
                Path.Combine(currentDirectory, "ReactChat.Server", "appsettings.json"),
                Path.Combine(currentDirectory, "appsettings.json")
            };

            var settingsFile = settingsFiles.FirstOrDefault(File.Exists);
            if (settingsFile is null)
            {
                throw new InvalidOperationException(
                    "Could not find ReactChat.Server/appsettings.json.");
            }

            using var document = JsonDocument.Parse(File.ReadAllText(settingsFile));
            if (document.RootElement.TryGetProperty("ConnectionStrings", out var connectionStrings)
                && connectionStrings.TryGetProperty("DefaultConnection", out var value)
                && !string.IsNullOrWhiteSpace(value.GetString()))
            {
                return value.GetString()!;
            }

            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is missing or empty in ReactChat.Server/appsettings.json.");
        }

    }
}
