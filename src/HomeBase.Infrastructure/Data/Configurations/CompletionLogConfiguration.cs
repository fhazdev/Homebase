using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeBase.Infrastructure.Data.Configurations;

public class CompletionLogConfiguration : IEntityTypeConfiguration<CompletionLog>
{
    public void Configure(EntityTypeBuilder<CompletionLog> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Notes).HasMaxLength(2000);
        builder.Property(c => c.PhotoUrl).HasMaxLength(500);
        builder.HasIndex(c => c.CompletedAt);
    }
}
