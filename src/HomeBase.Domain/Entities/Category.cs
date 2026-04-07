namespace HomeBase.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string Icon { get; set; } = "📋";
    public int SortOrder { get; set; }

    public required string UserId { get; set; }
    public User? User { get; set; }

    public ICollection<TrackedTask> Tasks { get; set; } = [];
}
