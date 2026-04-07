namespace HomeBase.Application.DTOs.Lists;

public record UpdateListItemRequest(string? Title, string? Url, string? Phone, string? Details, bool? IsCompleted, int? SortOrder);
