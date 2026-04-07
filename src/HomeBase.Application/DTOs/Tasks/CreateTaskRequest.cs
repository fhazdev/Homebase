using HomeBase.Domain.Enums;

namespace HomeBase.Application.DTOs.Tasks;

public record CreateTaskRequest(
    string Name,
    string? Icon,
    int? RecurrenceValue,
    RecurrenceUnit? RecurrenceUnit,
    string? Notes,
    DateTime? FirstDueDate,
    Guid CategoryId);
