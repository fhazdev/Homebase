namespace HomeBase.Application.DTOs.Lists;

public record ListItemDto(
    Guid Id,
    string Title,
    string? Url,
    string? Phone,
    string? Details,
    bool IsCompleted,
    int SortOrder);
