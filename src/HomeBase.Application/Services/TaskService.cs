using HomeBase.Application.DTOs.Tasks;
using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using HomeBase.Domain.Exceptions;

namespace HomeBase.Application.Services;

public class TaskService(
    ITaskRepository taskRepo,
    ICategoryRepository categoryRepo,
    ICompletionLogRepository completionRepo,
    IUnitOfWork unitOfWork)
{
    public async Task<List<TaskDto>> GetAllAsync(string userId, Guid? categoryId = null)
    {
        var tasks = await taskRepo.GetAllAsync(userId, categoryId);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDetailDto> GetByIdAsync(string userId, Guid id)
    {
        var task = await taskRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(TrackedTask), id);

        return new TaskDetailDto(
            task.Id, task.Name, task.Icon,
            task.RecurrenceValue, task.RecurrenceUnit,
            task.IsRecurring,
            task.Notes, task.FirstDueDate, task.NextDueDate,
            task.IsOverdue, task.DaysOverdue,
            task.CategoryId, task.Category?.Name,
            task.CreatedAt,
            task.Completions
                .OrderByDescending(c => c.CompletedAt)
                .Select(c => new CompletionLogDto(c.Id, c.CompletedAt, c.Notes, c.PhotoUrl))
                .ToList());
    }

    public async Task<TaskDto> CreateAsync(string userId, CreateTaskRequest request)
    {
        _ = await categoryRepo.GetByIdAsync(request.CategoryId, userId)
            ?? throw new NotFoundException(nameof(Category), request.CategoryId);

        var task = new TrackedTask
        {
            Name = request.Name,
            Icon = request.Icon ?? "🔧",
            RecurrenceValue = request.RecurrenceValue,
            RecurrenceUnit = request.RecurrenceUnit,
            Notes = request.Notes,
            FirstDueDate = request.FirstDueDate,
            CategoryId = request.CategoryId,
            UserId = userId
        };

        await taskRepo.AddAsync(task);
        await unitOfWork.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task<TaskDto> UpdateAsync(string userId, Guid id, UpdateTaskRequest request)
    {
        var task = await taskRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(TrackedTask), id);

        if (request.Name is not null) task.Name = request.Name;
        if (request.Icon is not null) task.Icon = request.Icon;
        if (request.Notes is not null) task.Notes = request.Notes;
        if (request.FirstDueDate.HasValue) task.FirstDueDate = request.FirstDueDate.Value;

        if (request.CategoryId.HasValue)
        {
            _ = await categoryRepo.GetByIdAsync(request.CategoryId.Value, userId)
                ?? throw new NotFoundException(nameof(Category), request.CategoryId.Value);
            task.CategoryId = request.CategoryId.Value;
        }

        if (request.IsRecurring.HasValue && !request.IsRecurring.Value)
        {
            // Converting to one-time: clear recurrence
            task.RecurrenceValue = null;
            task.RecurrenceUnit = null;
        }
        else
        {
            if (request.RecurrenceValue.HasValue) task.RecurrenceValue = request.RecurrenceValue.Value;
            if (request.RecurrenceUnit.HasValue) task.RecurrenceUnit = request.RecurrenceUnit.Value;
        }

        taskRepo.Update(task);
        await unitOfWork.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task DeleteAsync(string userId, Guid id)
    {
        var task = await taskRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(TrackedTask), id);

        taskRepo.Delete(task);
        await unitOfWork.SaveChangesAsync();
    }

    public async Task<CompletionLogDto> CompleteAsync(string userId, Guid taskId, CompleteTaskRequest request)
    {
        var task = await taskRepo.GetByIdAsync(taskId, userId)
            ?? throw new NotFoundException(nameof(TrackedTask), taskId);

        var log = new CompletionLog
        {
            CompletedAt = request.CompletedAt ?? DateTime.UtcNow,
            Notes = request.Notes,
            PhotoUrl = request.PhotoUrl,
            TaskId = task.Id
        };

        await completionRepo.AddAsync(log);
        await unitOfWork.SaveChangesAsync();

        return new CompletionLogDto(log.Id, log.CompletedAt, log.Notes, log.PhotoUrl);
    }

    public async Task<CompletionLogDto> UpdateCompletionAsync(string userId, Guid taskId, Guid logId, UpdateCompletionRequest request)
    {
        _ = await taskRepo.GetByIdAsync(taskId, userId)
            ?? throw new NotFoundException(nameof(TrackedTask), taskId);

        var log = await completionRepo.GetByIdAsync(logId, taskId)
            ?? throw new NotFoundException(nameof(CompletionLog), logId);

        if (request.CompletedAt.HasValue) log.CompletedAt = request.CompletedAt.Value;
        if (request.Notes is not null) log.Notes = request.Notes;

        completionRepo.Update(log);
        await unitOfWork.SaveChangesAsync();

        return new CompletionLogDto(log.Id, log.CompletedAt, log.Notes, log.PhotoUrl);
    }

    public async Task DeleteCompletionAsync(string userId, Guid taskId, Guid logId)
    {
        _ = await taskRepo.GetByIdAsync(taskId, userId)
            ?? throw new NotFoundException(nameof(TrackedTask), taskId);

        var log = await completionRepo.GetByIdAsync(logId, taskId)
            ?? throw new NotFoundException(nameof(CompletionLog), logId);

        completionRepo.Delete(log);
        await unitOfWork.SaveChangesAsync();
    }

    public async Task<(List<TaskDto> Overdue, List<TaskDto> Upcoming, List<(TrackedTask Task, CompletionLog Log)> Recent)>
        GetDashboardDataAsync(string userId, int upcomingDays = 7)
    {
        var allTasks = await taskRepo.GetAllAsync(userId);

        var overdue = allTasks
            .Where(t => t.IsOverdue)
            .OrderByDescending(t => t.DaysOverdue)
            .Select(MapToDto)
            .ToList();

        var upcoming = allTasks
            .Where(t => t.NextDueDate.HasValue && !t.IsOverdue
                && t.NextDueDate.Value <= DateTime.UtcNow.AddDays(upcomingDays))
            .OrderBy(t => t.NextDueDate)
            .Select(MapToDto)
            .ToList();

        var recent = allTasks
            .SelectMany(t => t.Completions.Select(c => (Task: t, Log: c)))
            .OrderByDescending(x => x.Log.CompletedAt)
            .Take(5)
            .ToList();

        return (overdue, upcoming, recent);
    }

    private static TaskDto MapToDto(TrackedTask task)
    {
        var lastCompletion = task.Completions
            .OrderByDescending(c => c.CompletedAt)
            .FirstOrDefault();

        return new TaskDto(
            task.Id, task.Name, task.Icon,
            task.RecurrenceValue, task.RecurrenceUnit,
            task.IsRecurring,
            task.Notes, task.FirstDueDate, task.NextDueDate,
            task.IsOverdue, task.DaysOverdue,
            task.CategoryId, task.Category?.Name,
            task.CreatedAt,
            lastCompletion is not null
                ? new CompletionLogDto(lastCompletion.Id, lastCompletion.CompletedAt, lastCompletion.Notes, lastCompletion.PhotoUrl)
                : null);
    }
}
