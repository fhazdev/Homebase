using HomeBase.Domain.Enums;

namespace HomeBase.Application.DTOs.Tasks;

public record TaskDto(
    Guid Id,
    string Name,
    string Icon,
    int? RecurrenceValue,
    RecurrenceUnit? RecurrenceUnit,
    bool IsRecurring,
    string? Notes,
    DateTime? FirstDueDate,
    DateTime? NextDueDate,
    bool IsOverdue,
    int? DaysOverdue,
    Guid CategoryId,
    string? CategoryName,
    DateTime CreatedAt,
    CompletionLogDto? LastCompletion);

public record TaskDetailDto(
    Guid Id,
    string Name,
    string Icon,
    int? RecurrenceValue,
    RecurrenceUnit? RecurrenceUnit,
    bool IsRecurring,
    string? Notes,
    DateTime? FirstDueDate,
    DateTime? NextDueDate,
    bool IsOverdue,
    int? DaysOverdue,
    Guid CategoryId,
    string? CategoryName,
    DateTime CreatedAt,
    List<CompletionLogDto> Completions);

public record CompletionLogDto(Guid Id, DateTime CompletedAt, string? Notes, string? PhotoUrl);
