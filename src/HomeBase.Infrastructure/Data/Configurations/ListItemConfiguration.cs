using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeBase.Infrastructure.Data.Configurations;

public class ListItemConfiguration : IEntityTypeConfiguration<ListItem>
{
    public void Configure(EntityTypeBuilder<ListItem> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Title).HasMaxLength(200).IsRequired();
        builder.Property(i => i.Url).HasMaxLength(2000);
        builder.Property(i => i.Phone).HasMaxLength(30);
        builder.Property(i => i.Details).HasMaxLength(2000);
    }
}
