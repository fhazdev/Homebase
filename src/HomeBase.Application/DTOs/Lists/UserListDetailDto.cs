namespace HomeBase.Application.DTOs.Lists;

public record UserListDetailDto(
    Guid Id,
    string Name,
    string Icon,
    int SortOrder,
    DateTime CreatedAt,
    List<ListItemDto> Items);
