using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeBase.Infrastructure.Data.Configurations;

public class TrackedTaskConfiguration : IEntityTypeConfiguration<TrackedTask>
{
    public void Configure(EntityTypeBuilder<TrackedTask> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Icon).HasMaxLength(10).HasDefaultValue("🔧");
        builder.Property(t => t.Notes).HasMaxLength(2000);
        builder.Property(t => t.RecurrenceValue).IsRequired(false);
        builder.Property(t => t.RecurrenceUnit).HasConversion<string>().HasMaxLength(20).IsRequired(false);

        builder.Ignore(t => t.NextDueDate);
        builder.Ignore(t => t.IsOverdue);
        builder.Ignore(t => t.DaysOverdue);
        builder.Ignore(t => t.IsRecurring);

        builder.HasOne(t => t.Category)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Completions)
            .WithOne(c => c.Task)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
