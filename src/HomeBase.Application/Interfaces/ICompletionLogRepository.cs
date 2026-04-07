using HomeBase.Domain.Entities;

namespace HomeBase.Application.Interfaces;

public interface ICompletionLogRepository
{
    Task<CompletionLog?> GetByIdAsync(Guid id, Guid taskId);
    Task<CompletionLog> AddAsync(CompletionLog log);
    void Update(CompletionLog log);
    void Delete(CompletionLog log);
}
