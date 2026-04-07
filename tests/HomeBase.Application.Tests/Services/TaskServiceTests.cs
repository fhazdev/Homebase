using HomeBase.Application.DTOs.Tasks;
using HomeBase.Application.Interfaces;
using HomeBase.Application.Services;
using HomeBase.Domain.Entities;
using HomeBase.Domain.Enums;
using HomeBase.Domain.Exceptions;
using Moq;

namespace HomeBase.Application.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepo = new();
    private readonly Mock<ICategoryRepository> _categoryRepo = new();
    private readonly Mock<ICompletionLogRepository> _completionRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly TaskService _sut;

    private const string UserId = "user-1";

    public TaskServiceTests()
    {
        _sut = new TaskService(
            _taskRepo.Object,
            _categoryRepo.Object,
            _completionRepo.Object,
            _unitOfWork.Object);
    }

    private static TrackedTask MakeTask(Guid? id = null, string userId = UserId)
    {
        var taskId = id ?? Guid.NewGuid();
        return new TrackedTask
        {
            Id = taskId,
            Name = "Test Task",
            RecurrenceValue = 1,
            RecurrenceUnit = RecurrenceUnit.Weeks,
            CategoryId = Guid.NewGuid(),
            UserId = userId,
            Category = new Category { Name = "Home", UserId = userId }
        };
    }

    // ── GetAllAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsMappedDtos()
    {
        var tasks = new List<TrackedTask> { MakeTask(), MakeTask() };
        _taskRepo.Setup(r => r.GetAllAsync(UserId, null)).ReturnsAsync(tasks);

        var result = await _sut.GetAllAsync(UserId);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetAllAsync_WithCategoryFilter_PassesFilter()
    {
        var catId = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetAllAsync(UserId, catId)).ReturnsAsync([]);

        await _sut.GetAllAsync(UserId, catId);

        _taskRepo.Verify(r => r.GetAllAsync(UserId, catId), Times.Once);
    }

    // ── GetByIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_Found_ReturnsDetail()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

        var result = await _sut.GetByIdAsync(UserId, task.Id);

        Assert.Equal(task.Name, result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync((TrackedTask?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(UserId, id));
    }

    // ── CreateAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_ValidRequest_CreatesTask()
    {
        var catId = Guid.NewGuid();
        var category = new Category { Id = catId, Name = "Home", UserId = UserId };
        _categoryRepo.Setup(r => r.GetByIdAsync(catId, UserId)).ReturnsAsync(category);
        _taskRepo.Setup(r => r.AddAsync(It.IsAny<TrackedTask>()))
            .ReturnsAsync((TrackedTask t) => t);

        var request = new CreateTaskRequest("New Task", null, 2, RecurrenceUnit.Weeks, null, null, catId);
        var result = await _sut.CreateAsync(UserId, request);

        Assert.Equal("New Task", result.Name);
        Assert.Equal("🔧", result.Icon);
        _unitOfWork.Verify(u => u.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_CategoryNotFound_ThrowsNotFoundException()
    {
        var catId = Guid.NewGuid();
        _categoryRepo.Setup(r => r.GetByIdAsync(catId, UserId)).ReturnsAsync((Category?)null);

        var request = new CreateTaskRequest("Task", null, 1, RecurrenceUnit.Days, null, null, catId);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.CreateAsync(UserId, request));
    }

    [Fact]
    public async Task CreateAsync_CustomIcon_UsesProvidedIcon()
    {
        var catId = Guid.NewGuid();
        _categoryRepo.Setup(r => r.GetByIdAsync(catId, UserId))
            .ReturnsAsync(new Category { Id = catId, Name = "Home", UserId = UserId });
        _taskRepo.Setup(r => r.AddAsync(It.IsAny<TrackedTask>()))
            .ReturnsAsync((TrackedTask t) => t);

        var request = new CreateTaskRequest("Task", "🏠", 1, RecurrenceUnit.Days, null, null, catId);
        var result = await _sut.CreateAsync(UserId, request);

        Assert.Equal("🏠", result.Icon);
    }

    // ── UpdateAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_ValidRequest_UpdatesFields()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

        var request = new UpdateTaskRequest("Updated Name", null, null, null, null, null, null, null);
        var result = await _sut.UpdateAsync(UserId, task.Id, request);

        Assert.Equal("Updated Name", result.Name);
        _taskRepo.Verify(r => r.Update(task), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync((TrackedTask?)null);

        var request = new UpdateTaskRequest("Name", null, null, null, null, null, null, null);
        await Assert.ThrowsAsync<NotFoundException>(() => _sut.UpdateAsync(UserId, id, request));
    }

    [Fact]
    public async Task UpdateAsync_CategoryChange_ValidatesNewCategory()
    {
        var task = MakeTask();
        var newCatId = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
        _categoryRepo.Setup(r => r.GetByIdAsync(newCatId, UserId)).ReturnsAsync((Category?)null);

        var request = new UpdateTaskRequest(null, null, null, null, null, null, null, newCatId);
        await Assert.ThrowsAsync<NotFoundException>(() => _sut.UpdateAsync(UserId, task.Id, request));
    }

    // ── DeleteAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_Found_DeletesTask()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

        await _sut.DeleteAsync(UserId, task.Id);

        _taskRepo.Verify(r => r.Delete(task), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync((TrackedTask?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(UserId, id));
    }

    // ── CompleteAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task CompleteAsync_ValidRequest_AddsCompletionLog()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
        _completionRepo.Setup(r => r.AddAsync(It.IsAny<CompletionLog>()))
            .ReturnsAsync((CompletionLog c) => c);

        var request = new CompleteTaskRequest(null, "done!", null);
        var result = await _sut.CompleteAsync(UserId, task.Id, request);

        Assert.Equal("done!", result.Notes);
        _unitOfWork.Verify(u => u.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task CompleteAsync_TaskNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetByIdAsync(id, UserId)).ReturnsAsync((TrackedTask?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.CompleteAsync(UserId, id, new CompleteTaskRequest(null, null, null)));
    }

    [Fact]
    public async Task CompleteAsync_CustomDate_UsesProvidedDate()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
        _completionRepo.Setup(r => r.AddAsync(It.IsAny<CompletionLog>()))
            .ReturnsAsync((CompletionLog c) => c);

        var customDate = new DateTime(2026, 1, 15, 12, 0, 0, DateTimeKind.Utc);
        var request = new CompleteTaskRequest(customDate, null, null);
        var result = await _sut.CompleteAsync(UserId, task.Id, request);

        Assert.Equal(customDate, result.CompletedAt);
    }

    // ── UpdateCompletionAsync ────────────────────────────────────────────

    [Fact]
    public async Task UpdateCompletionAsync_NotFound_ThrowsNotFoundException()
    {
        var taskId = Guid.NewGuid();
        _taskRepo.Setup(r => r.GetByIdAsync(taskId, UserId)).ReturnsAsync((TrackedTask?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.UpdateCompletionAsync(UserId, taskId, Guid.NewGuid(), new UpdateCompletionRequest(null, null)));
    }

    [Fact]
    public async Task UpdateCompletionAsync_LogNotFound_ThrowsNotFoundException()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
        _completionRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), task.Id))
            .ReturnsAsync((CompletionLog?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.UpdateCompletionAsync(UserId, task.Id, Guid.NewGuid(), new UpdateCompletionRequest(null, null)));
    }

    // ── DeleteCompletionAsync ────────────────────────────────────────────

    [Fact]
    public async Task DeleteCompletionAsync_Found_Deletes()
    {
        var task = MakeTask();
        var log = new CompletionLog { Id = Guid.NewGuid(), TaskId = task.Id };
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
        _completionRepo.Setup(r => r.GetByIdAsync(log.Id, task.Id)).ReturnsAsync(log);

        await _sut.DeleteCompletionAsync(UserId, task.Id, log.Id);

        _completionRepo.Verify(r => r.Delete(log), Times.Once);
    }

    // ── GetDashboardDataAsync ────────────────────────────────────────────

    [Fact]
    public async Task GetDashboardDataAsync_CategorizesTasks()
    {
        var overdueTask = MakeTask();
        overdueTask.FirstDueDate = DateTime.UtcNow.AddDays(-5);

        var upcomingTask = MakeTask();
        upcomingTask.FirstDueDate = DateTime.UtcNow.AddDays(3);

        var noDateTask = MakeTask();

        _taskRepo.Setup(r => r.GetAllAsync(UserId, null))
            .ReturnsAsync([overdueTask, upcomingTask, noDateTask]);

        var (overdue, upcoming, recent) = await _sut.GetDashboardDataAsync(UserId);

        Assert.Single(overdue);
        Assert.Single(upcoming);
        Assert.Empty(recent);
    }
}
