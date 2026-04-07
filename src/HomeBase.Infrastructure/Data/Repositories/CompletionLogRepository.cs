using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Infrastructure.Data.Repositories;

public class CompletionLogRepository(HomeBaseDbContext db) : ICompletionLogRepository
{
    public async Task<CompletionLog?> GetByIdAsync(Guid id, Guid taskId)
    {
        return await db.CompletionLogs
            .FirstOrDefaultAsync(c => c.Id == id && c.TaskId == taskId);
    }

    public async Task<CompletionLog> AddAsync(CompletionLog log)
    {
        await db.CompletionLogs.AddAsync(log);
        return log;
    }

    public void Update(CompletionLog log) => db.CompletionLogs.Update(log);

    public void Delete(CompletionLog log) => db.CompletionLogs.Remove(log);
}
