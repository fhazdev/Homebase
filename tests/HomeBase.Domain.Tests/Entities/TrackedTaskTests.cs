using HomeBase.Domain.Entities;
using HomeBase.Domain.Enums;

namespace HomeBase.Domain.Tests.Entities;

public class TrackedTaskTests
{
    private static TrackedTask CreateTask(
        int recurrenceValue = 1,
        RecurrenceUnit recurrenceUnit = RecurrenceUnit.Weeks,
        DateTime? firstDueDate = null)
    {
        return new TrackedTask
        {
            Id = Guid.NewGuid(),
            Name = "Test Task",
            RecurrenceValue = recurrenceValue,
            RecurrenceUnit = recurrenceUnit,
            FirstDueDate = firstDueDate,
            UserId = "user-1"
        };
    }

    private static CompletionLog CreateCompletion(Guid taskId, DateTime completedAt)
    {
        return new CompletionLog
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            CompletedAt = completedAt
        };
    }

    // ── NextDueDate ──────────────────────────────────────────────────────

    [Fact]
    public void NextDueDate_NoCompletions_NoFirstDueDate_ReturnsNull()
    {
        var task = CreateTask();
        Assert.Null(task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_NoCompletions_WithFirstDueDate_ReturnsFirstDueDate()
    {
        var firstDue = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc);
        var task = CreateTask(firstDueDate: firstDue);
        Assert.Equal(firstDue, task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_Days_ReturnsLastCompletionPlusDays()
    {
        var task = CreateTask(recurrenceValue: 30, recurrenceUnit: RecurrenceUnit.Days);
        var completedAt = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc);
        task.Completions.Add(CreateCompletion(task.Id, completedAt));

        Assert.Equal(completedAt.AddDays(30), task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_Weeks_ReturnsLastCompletionPlusWeeks()
    {
        var task = CreateTask(recurrenceValue: 2, recurrenceUnit: RecurrenceUnit.Weeks);
        var completedAt = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc);
        task.Completions.Add(CreateCompletion(task.Id, completedAt));

        Assert.Equal(completedAt.AddDays(14), task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_Months_ReturnsLastCompletionPlusMonths()
    {
        var task = CreateTask(recurrenceValue: 3, recurrenceUnit: RecurrenceUnit.Months);
        var completedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc);
        task.Completions.Add(CreateCompletion(task.Id, completedAt));

        Assert.Equal(completedAt.AddMonths(3), task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_Years_ReturnsLastCompletionPlusYears()
    {
        var task = CreateTask(recurrenceValue: 1, recurrenceUnit: RecurrenceUnit.Years);
        var completedAt = new DateTime(2025, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        task.Completions.Add(CreateCompletion(task.Id, completedAt));

        Assert.Equal(completedAt.AddYears(1), task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_Miles_ReturnsNull()
    {
        var task = CreateTask(recurrenceValue: 5000, recurrenceUnit: RecurrenceUnit.Miles);
        task.Completions.Add(CreateCompletion(task.Id, DateTime.UtcNow));

        Assert.Null(task.NextDueDate);
    }

    [Fact]
    public void NextDueDate_MultipleCompletions_UsesLatest()
    {
        var task = CreateTask(recurrenceValue: 7, recurrenceUnit: RecurrenceUnit.Days);
        var older = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var newer = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc);

        task.Completions.Add(CreateCompletion(task.Id, older));
        task.Completions.Add(CreateCompletion(task.Id, newer));

        Assert.Equal(newer.AddDays(7), task.NextDueDate);
    }

    // ── IsOverdue ────────────────────────────────────────────────────────

    [Fact]
    public void IsOverdue_NullNextDueDate_ReturnsFalse()
    {
        var task = CreateTask();
        Assert.False(task.IsOverdue);
    }

    [Fact]
    public void IsOverdue_PastDueDate_ReturnsTrue()
    {
        var task = CreateTask(firstDueDate: DateTime.UtcNow.AddDays(-5));
        Assert.True(task.IsOverdue);
    }

    [Fact]
    public void IsOverdue_FutureDueDate_ReturnsFalse()
    {
        var task = CreateTask(firstDueDate: DateTime.UtcNow.AddDays(5));
        Assert.False(task.IsOverdue);
    }

    // ── DaysOverdue ──────────────────────────────────────────────────────

    [Fact]
    public void DaysOverdue_NotOverdue_ReturnsNull()
    {
        var task = CreateTask(firstDueDate: DateTime.UtcNow.AddDays(5));
        Assert.Null(task.DaysOverdue);
    }

    [Fact]
    public void DaysOverdue_Overdue_ReturnsCorrectDays()
    {
        var task = CreateTask(firstDueDate: DateTime.UtcNow.AddDays(-10));
        Assert.NotNull(task.DaysOverdue);
        Assert.Equal(10, task.DaysOverdue);
    }

    // ── Defaults ─────────────────────────────────────────────────────────

    [Fact]
    public void Defaults_IconIsWrench()
    {
        var task = CreateTask();
        Assert.Equal("🔧", task.Icon);
    }

    [Fact]
    public void Defaults_CompletionsIsEmpty()
    {
        var task = CreateTask();
        Assert.Empty(task.Completions);
    }
}
