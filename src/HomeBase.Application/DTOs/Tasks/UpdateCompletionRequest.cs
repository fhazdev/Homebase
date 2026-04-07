namespace HomeBase.Application.DTOs.Tasks;

public record UpdateCompletionRequest(DateTime? CompletedAt, string? Notes);
