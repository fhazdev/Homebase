using HomeBase.Domain.Enums;

namespace HomeBase.Application.DTOs.Tasks;

public record UpdateTaskRequest(
    string? Name,
    string? Icon,
    int? RecurrenceValue,
    RecurrenceUnit? RecurrenceUnit,
    bool? IsRecurring,
    string? Notes,
    DateTime? FirstDueDate,
    Guid? CategoryId);
