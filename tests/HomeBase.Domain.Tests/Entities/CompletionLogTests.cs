using HomeBase.Domain.Entities;

namespace HomeBase.Domain.Tests.Entities;

public class CompletionLogTests
{
    [Fact]
    public void Defaults_CompletedAtIsSetToUtcNow()
    {
        var before = DateTime.UtcNow;
        var log = new CompletionLog { TaskId = Guid.NewGuid() };
        var after = DateTime.UtcNow;

        Assert.InRange(log.CompletedAt, before, after);
    }

    [Fact]
    public void Defaults_NotesIsNull()
    {
        var log = new CompletionLog { TaskId = Guid.NewGuid() };
        Assert.Null(log.Notes);
    }

    [Fact]
    public void Defaults_PhotoUrlIsNull()
    {
        var log = new CompletionLog { TaskId = Guid.NewGuid() };
        Assert.Null(log.PhotoUrl);
    }
}
