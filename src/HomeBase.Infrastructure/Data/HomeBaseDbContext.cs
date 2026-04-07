using HomeBase.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Infrastructure.Data;

public class HomeBaseDbContext(DbContextOptions<HomeBaseDbContext> options)
    : IdentityDbContext<User>(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<TrackedTask> TrackedTasks => Set<TrackedTask>();
    public DbSet<CompletionLog> CompletionLogs => Set<CompletionLog>();
    public DbSet<UserList> UserLists => Set<UserList>();
    public DbSet<ListItem> ListItems => Set<ListItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(HomeBaseDbContext).Assembly);
    }
}
