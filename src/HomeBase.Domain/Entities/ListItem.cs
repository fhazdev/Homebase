namespace HomeBase.Domain.Entities;

public class ListItem
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public string? Phone { get; set; }
    public string? Details { get; set; }
    public bool IsCompleted { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserListId { get; set; }
    public UserList? UserList { get; set; }
}
