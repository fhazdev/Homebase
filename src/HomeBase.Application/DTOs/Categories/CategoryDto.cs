namespace HomeBase.Application.DTOs.Categories;

public record CategoryDto(Guid Id, string Name, string Icon, int SortOrder, int TaskCount);
