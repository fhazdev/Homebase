using HomeBase.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Api.Middleware;

/// <summary>
/// Applies pending EF Core migrations after the host starts listening.
/// Inherits BackgroundService so ExecuteAsync is fired-and-forgotten from StartAsync,
/// meaning Kestrel binds to port 8080 immediately and the liveness probe passes while
/// the serverless DB is still waking up (30-60 s). The readiness probe stays 503 until
/// the DB health check passes once migrations complete.
/// </summary>
public class MigrationHostedService(IServiceProvider serviceProvider, ILogger<MigrationHostedService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            logger.LogInformation("Applying pending database migrations...");
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<HomeBaseDbContext>();
            await db.Database.MigrateAsync(stoppingToken);
            logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database migration failed — the app will stay up but may not function correctly.");
        }
    }
}
