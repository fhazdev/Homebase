namespace HomeBase.Application.DTOs.Lists;

public record UserListDto(
    Guid Id,
    string Name,
    string Icon,
    int SortOrder,
    int ItemCount,
    int CompletedCount,
    DateTime CreatedAt);
