using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReactChat.Domain;

namespace ReactChat.Data.Mapping
{
    internal sealed class CustomerMap : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.ToTable("Customer");
            builder.HasKey(i => i.Id);
            builder.Property(i => i.Id).ValueGeneratedOnAdd();

            builder.Property(i => i.UserName)
                .IsRequired()
                .HasMaxLength(DomainConstants.UserNameMaxLength);

            builder.Property(i => i.Email)
                .IsRequired()
                .HasMaxLength(DomainConstants.EmailMaxLength);
        }
    }
}