namespace HomeBase.Application.DTOs.Tasks;

public record CompleteTaskRequest(DateTime? CompletedAt, string? Notes, string? PhotoUrl);
