using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Infrastructure.Data.Repositories;

public class CategoryRepository(HomeBaseDbContext db) : ICategoryRepository
{
    public async Task<Category?> GetByIdAsync(Guid id, string userId)
    {
        return await db.Categories
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
    }

    public async Task<List<Category>> GetAllAsync(string userId)
    {
        return await db.Categories
            .Include(c => c.Tasks)
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
    }

    public async Task<Category> AddAsync(Category category)
    {
        await db.Categories.AddAsync(category);
        return category;
    }

    public void Update(Category category) => db.Categories.Update(category);

    public void Delete(Category category) => db.Categories.Remove(category);

    public async Task<bool> HasTasksAsync(Guid categoryId)
    {
        return await db.TrackedTasks.AnyAsync(t => t.CategoryId == categoryId);
    }
}
