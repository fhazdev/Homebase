using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeBase.Infrastructure.Data.Configurations;

public class UserListConfiguration : IEntityTypeConfiguration<UserList>
{
    public void Configure(EntityTypeBuilder<UserList> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Name).HasMaxLength(100).IsRequired();
        builder.Property(l => l.Icon).HasMaxLength(10).HasDefaultValue("📋");
        builder.HasIndex(l => new { l.UserId, l.Name }).IsUnique();

        builder.HasOne(l => l.User)
            .WithMany(u => u.Lists)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Items)
            .WithOne(i => i.UserList)
            .HasForeignKey(i => i.UserListId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
