using HomeBase.Application.DTOs.Categories;
using HomeBase.Application.Interfaces;
using HomeBase.Application.Services;
using HomeBase.Domain.Entities;
using HomeBase.Domain.Exceptions;
using Moq;

namespace HomeBase.Application.Tests.Services;

public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _categoryRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly CategoryService _sut;

    private const string UserId = "user-1";

    public CategoryServiceTests()
    {
        _sut = new CategoryService(_categoryRepo.Object, _unitOfWork.Object);
    }

    private static Category MakeCategory(string name = "Home", Guid? id = null)
    {
        return new Category
        {
            Id = id ?? Guid.NewGuid(),
            Name = name,
            Icon = "🏠",
            SortOrder = 0,
            UserId = UserId
        };
    }

    // ── GetAllAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsOrderedBySortOrder()
    {
        var cats = new List<Category>
        {
            new() { Id = Guid.NewGuid(), Name = "B", SortOrder = 1, UserId = UserId },
            new() { Id = Guid.NewGuid(), Name = "A", SortOrder = 0, UserId = UserId }
        };
        _categoryRepo.Setup(r => r.GetAllAsync(UserId)).ReturnsAsync(cats);

        var result = await _sut.GetAllAsync(UserId);

        Assert.Equal("A", result[0].Name);
        Assert.Equal("B", result[1].Name);
    }

    [Fact]
    public async Task GetAllAsync_IncludesTaskCount()
    {
        var cat = MakeCategory();
        cat.Tasks.Add(new TrackedTask { Name = "T1", UserId = UserId });
        cat.Tasks.Add(new TrackedTask { Name = "T2", UserId = UserId });
        _categoryRepo.Setup(r => r.GetAllAsync(UserId)).ReturnsAsync([cat]);

        var result = await _sut.GetAllAsync(UserId);

        Assert.Equal(2, result[0].TaskCount);
    }

    // ── CreateAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_SetsAutoSortOrder()
    {
        var existing = new List<Category> { MakeCategory(), MakeCategory("Vehicle") };
        _categoryRepo.Setup(r => r.GetAllAsync(UserId)).ReturnsAsync(existing);
        _categoryRepo.Setup(r => r.AddAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        var result = await _sut.CreateAsync(UserId, new CreateCategoryRequest("New", null));

        Assert.Equal(2, result.SortOrder);
    }

    [Fact]
    public async Task CreateAsync_DefaultIcon_IsClipboard()
    {
        _categoryRepo.Setup(r => r.GetAllAsync(UserId)).ReturnsAsync([]);
        _categoryRepo.Setup(r => r.AddAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        var result = await _sut.CreateAsync(UserId, new CreateCategoryRequest("Test", null));

        Assert.Equal("📋", result.Icon);
    }

    [Fact]
    public async Task CreateAsync_CustomIcon_UsesProvided()
    {
        _categoryRepo.Setup(r => r.GetAllAsync(UserId)).ReturnsAsync([]);
        _categoryRepo.Setup(r => r.AddAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        var result = await _sut.CreateAsync(UserId, new CreateCategoryRequest("Test", "🚗"));

        Assert.Equal("🚗", result.Icon);
    }

    // ── UpdateAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_UpdatesFields()
    {
        var cat = MakeCategory();
        _categoryRepo.Setup(r => r.GetByIdAsync(cat.Id, UserId)).ReturnsAsync(cat);

        var result = await _sut.UpdateAsync(UserId, cat.Id, new UpdateCategoryRequest("Updated", "🌿", 5));

        Assert.Equal("Updated", result.Name);
        Assert.Equal("🌿", result.Icon);
        Assert.Equal(5, result.SortOrder);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _categoryRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.UpdateAsync(UserId, id, new UpdateCategoryRequest("X", null, null)));
    }

    // ── DeleteAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_ReassignsTasksAndDeletes()
    {
        var catId = Guid.NewGuid();
        var targetId = Guid.NewGuid();
        var cat = MakeCategory(id: catId);
        var target = MakeCategory("Target", targetId);
        var task = new TrackedTask { Name = "T", UserId = UserId, CategoryId = catId };
        cat.Tasks.Add(task);

        _categoryRepo.Setup(r => r.GetByIdAsync(catId, UserId)).ReturnsAsync(cat);
        _categoryRepo.Setup(r => r.GetByIdAsync(targetId, UserId)).ReturnsAsync(target);

        await _sut.DeleteAsync(UserId, catId, targetId);

        Assert.Equal(targetId, task.CategoryId);
        _categoryRepo.Verify(r => r.Delete(cat), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_SameCategory_ThrowsConflictException()
    {
        var id = Guid.NewGuid();
        var cat = MakeCategory(id: id);
        _categoryRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync(cat);

        await Assert.ThrowsAsync<ConflictException>(() => _sut.DeleteAsync(UserId, id, id));
    }

    [Fact]
    public async Task DeleteAsync_CategoryNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _categoryRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.DeleteAsync(UserId, id, Guid.NewGuid()));
    }

    [Fact]
    public async Task DeleteAsync_TargetCategoryNotFound_ThrowsNotFoundException()
    {
        var catId = Guid.NewGuid();
        var targetId = Guid.NewGuid();
        _categoryRepo.Setup(r => r.GetByIdAsync(catId, UserId)).ReturnsAsync(MakeCategory(id: catId));
        _categoryRepo.Setup(r => r.GetByIdAsync(targetId, UserId)).ReturnsAsync((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.DeleteAsync(UserId, catId, targetId));
    }

    // ── SeedDefaultCategoriesAsync ───────────────────────────────────────

    [Fact]
    public async Task SeedDefaultCategoriesAsync_CreatesThreeCategories()
    {
        _categoryRepo.Setup(r => r.AddAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        await _sut.SeedDefaultCategoriesAsync(UserId);

        _categoryRepo.Verify(r => r.AddAsync(It.IsAny<Category>()), Times.Exactly(3));
        _unitOfWork.Verify(u => u.SaveChangesAsync(default), Times.Once);
    }
}
