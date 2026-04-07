using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Infrastructure.Data.Repositories;

public class TaskRepository(HomeBaseDbContext db) : ITaskRepository
{
    public async Task<TrackedTask?> GetByIdAsync(Guid id, string userId)
    {
        return await db.TrackedTasks
            .Include(t => t.Category)
            .Include(t => t.Completions)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    }

    public async Task<List<TrackedTask>> GetAllAsync(string userId, Guid? categoryId = null)
    {
        var query = db.TrackedTasks
            .Include(t => t.Category)
            .Include(t => t.Completions)
            .Where(t => t.UserId == userId);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        return await query.OrderBy(t => t.Name).ToListAsync();
    }

    public async Task<TrackedTask> AddAsync(TrackedTask task)
    {
        await db.TrackedTasks.AddAsync(task);
        return task;
    }

    public void Update(TrackedTask task) => db.TrackedTasks.Update(task);

    public void Delete(TrackedTask task) => db.TrackedTasks.Remove(task);
}
