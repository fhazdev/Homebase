using HomeBase.Application.DTOs.Categories;
using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using HomeBase.Domain.Exceptions;

namespace HomeBase.Application.Services;

public class CategoryService(ICategoryRepository categoryRepo, IUnitOfWork unitOfWork)
{
    public async Task<List<CategoryDto>> GetAllAsync(string userId)
    {
        var categories = await categoryRepo.GetAllAsync(userId);
        return categories
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Icon, c.SortOrder, c.Tasks.Count))
            .ToList();
    }

    public async Task<CategoryDto> CreateAsync(string userId, CreateCategoryRequest request)
    {
        var existing = await categoryRepo.GetAllAsync(userId);
        var category = new Category
        {
            Name = request.Name,
            Icon = request.Icon ?? "📋",
            SortOrder = existing.Count,
            UserId = userId
        };

        await categoryRepo.AddAsync(category);
        await unitOfWork.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Name, category.Icon, category.SortOrder, 0);
    }

    public async Task<CategoryDto> UpdateAsync(string userId, Guid id, UpdateCategoryRequest request)
    {
        var category = await categoryRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(Category), id);

        if (request.Name is not null) category.Name = request.Name;
        if (request.Icon is not null) category.Icon = request.Icon;
        if (request.SortOrder.HasValue) category.SortOrder = request.SortOrder.Value;

        categoryRepo.Update(category);
        await unitOfWork.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Name, category.Icon, category.SortOrder, category.Tasks.Count);
    }

    public async Task DeleteAsync(string userId, Guid id, Guid reassignToCategoryId)
    {
        var category = await categoryRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(Category), id);

        if (id == reassignToCategoryId)
            throw new ConflictException("Cannot reassign tasks to the same category being deleted.");

        var targetCategory = await categoryRepo.GetByIdAsync(reassignToCategoryId, userId)
            ?? throw new NotFoundException(nameof(Category), reassignToCategoryId);

        foreach (var task in category.Tasks)
        {
            task.CategoryId = targetCategory.Id;
        }

        categoryRepo.Delete(category);
        await unitOfWork.SaveChangesAsync();
    }

    public async Task SeedDefaultCategoriesAsync(string userId)
    {
        var defaults = new[] { ("Home", "🏠"), ("Vehicle", "🚗"), ("Yard", "🌿") };
        for (var i = 0; i < defaults.Length; i++)
        {
            await categoryRepo.AddAsync(new Category
            {
                Name = defaults[i].Item1,
                Icon = defaults[i].Item2,
                SortOrder = i,
                UserId = userId
            });
        }
        await unitOfWork.SaveChangesAsync();
    }
}
