namespace HomeBase.Application.DTOs.Lists;

public record CreateListItemRequest(string Title, string? Url, string? Phone, string? Details);
