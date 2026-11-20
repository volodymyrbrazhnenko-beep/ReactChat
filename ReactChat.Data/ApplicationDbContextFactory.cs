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
            var environmentConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
            if (!string.IsNullOrWhiteSpace(environmentConnectionString))
            {
                return environmentConnectionString;
            }

            var searchDirectories = new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory }
                .SelectMany(GetAncestorDirectories)
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var directory in searchDirectories)
            {
                var settingsFiles = new[]
                {
                    Path.Combine(directory, "appsettings.json"),
                    Path.Combine(directory, "ReactChat.Server", "appsettings.json")
                };

                foreach (var settingsFile in settingsFiles)
                {
                    if (!File.Exists(settingsFile))
                    {
                        continue;
                    }

                    using var document = JsonDocument.Parse(File.ReadAllText(settingsFile));
                    if (document.RootElement.TryGetProperty("ConnectionStrings", out var connectionStrings)
                        && connectionStrings.TryGetProperty("DefaultConnection", out var value)
                        && !string.IsNullOrWhiteSpace(value.GetString()))
                    {
                        return value.GetString()!;
                    }
                }
            }

            throw new InvalidOperationException(
                "Could not find ConnectionStrings:DefaultConnection. Set the ConnectionStrings__DefaultConnection environment variable or ensure ReactChat.Server/appsettings.json is available.");
        }

        private static IEnumerable<string> GetAncestorDirectories(string path)
        {
            var directory = new DirectoryInfo(path);
            while (directory is not null)
            {
                yield return directory.FullName;
                directory = directory.Parent;
            }
        }
    }
}
