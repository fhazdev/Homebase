using HomeBase.Domain.Entities;

namespace HomeBase.Application.Interfaces;

public interface ITaskRepository
{
    Task<TrackedTask?> GetByIdAsync(Guid id, string userId);
    Task<List<TrackedTask>> GetAllAsync(string userId, Guid? categoryId = null);
    Task<TrackedTask> AddAsync(TrackedTask task);
    void Update(TrackedTask task);
    void Delete(TrackedTask task);
}
