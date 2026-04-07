using HomeBase.Domain.Entities;

namespace HomeBase.Domain.Tests.Entities;

public class CategoryTests
{
    [Fact]
    public void Defaults_IconIsClipboard()
    {
        var category = new Category { Name = "Test", UserId = "user-1" };
        Assert.Equal("📋", category.Icon);
    }

    [Fact]
    public void Defaults_SortOrderIsZero()
    {
        var category = new Category { Name = "Test", UserId = "user-1" };
        Assert.Equal(0, category.SortOrder);
    }

    [Fact]
    public void Defaults_TasksCollectionIsEmpty()
    {
        var category = new Category { Name = "Test", UserId = "user-1" };
        Assert.Empty(category.Tasks);
    }
}
