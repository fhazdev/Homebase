using HomeBase.Application.Interfaces;

namespace HomeBase.Infrastructure.Data;

public class UnitOfWork(HomeBaseDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
