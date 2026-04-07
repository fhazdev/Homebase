using Microsoft.AspNetCore.Identity;

namespace HomeBase.Domain.Entities;

public class User : IdentityUser
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Category> Categories { get; set; } = [];
    public ICollection<TrackedTask> Tasks { get; set; } = [];
    public ICollection<UserList> Lists { get; set; } = [];
}
