using HomeBase.Domain.Entities;

namespace HomeBase.Application.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id, string userId);
    Task<List<Category>> GetAllAsync(string userId);
    Task<Category> AddAsync(Category category);
    void Update(Category category);
    void Delete(Category category);
    Task<bool> HasTasksAsync(Guid categoryId);
}
