using HomeBase.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HomeBase.Api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove the existing HomeBaseDbContext registration and its options
            var descriptors = services.Where(d =>
                d.ServiceType == typeof(HomeBaseDbContext) ||
                d.ServiceType == typeof(DbContextOptions<HomeBaseDbContext>) ||
                d.ServiceType == typeof(DbContextOptions))
                .ToList();
            foreach (var d in descriptors) services.Remove(d);

            // Build fresh DbContextOptions that ONLY has SQLite (no inherited SqlServer extensions)
            var freshOptions = new DbContextOptionsBuilder<HomeBaseDbContext>()
                .UseSqlite(_connection)
                .Options;

            services.AddSingleton(freshOptions);
            services.AddSingleton<DbContextOptions>(freshOptions);
            services.AddScoped<HomeBaseDbContext>();
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HomeBaseDbContext>();
        db.Database.EnsureCreated();

        return host;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}
