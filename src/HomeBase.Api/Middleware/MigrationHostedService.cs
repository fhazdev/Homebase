using HomeBase.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Api.Middleware;

/// <summary>
/// Applies pending EF Core migrations in the background after the app starts listening.
/// Running migrations here (rather than before app.Run) ensures the process binds to port 8080
/// immediately so the container liveness probe passes even while the serverless DB is waking up.
/// The readiness probe will return 503 until the DB health check passes after migrations complete.
/// </summary>
public class MigrationHostedService(IServiceProvider serviceProvider, ILogger<MigrationHostedService> logger)
    : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Applying pending database migrations...");
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HomeBaseDbContext>();
        await db.Database.MigrateAsync(cancellationToken);
        logger.LogInformation("Database migrations applied successfully.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
