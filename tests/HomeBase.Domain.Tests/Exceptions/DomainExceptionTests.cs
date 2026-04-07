using HomeBase.Domain.Exceptions;

namespace HomeBase.Domain.Tests.Exceptions;

public class DomainExceptionTests
{
    [Fact]
    public void DomainException_HasCorrectMessage()
    {
        var ex = new DomainException("something went wrong");
        Assert.Equal("something went wrong", ex.Message);
    }

    [Fact]
    public void NotFoundException_FormatsMessage()
    {
        var id = Guid.NewGuid();
        var ex = new NotFoundException("TrackedTask", id);
        Assert.Equal($"TrackedTask with key '{id}' was not found.", ex.Message);
    }

    [Fact]
    public void NotFoundException_IsDomainException()
    {
        var ex = new NotFoundException("Entity", "key");
        Assert.IsAssignableFrom<DomainException>(ex);
    }

    [Fact]
    public void ConflictException_HasCorrectMessage()
    {
        var ex = new ConflictException("conflict occurred");
        Assert.Equal("conflict occurred", ex.Message);
    }

    [Fact]
    public void ConflictException_IsDomainException()
    {
        var ex = new ConflictException("conflict");
        Assert.IsAssignableFrom<DomainException>(ex);
    }
}
