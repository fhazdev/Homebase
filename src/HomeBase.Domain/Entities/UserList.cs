namespace HomeBase.Domain.Entities;

public class UserList
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string Icon { get; set; } = "📋";
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public required string UserId { get; set; }
    public User? User { get; set; }

    public ICollection<ListItem> Items { get; set; } = [];
}
