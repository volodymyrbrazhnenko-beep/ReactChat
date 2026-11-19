using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReactChat.Domain;

namespace ReactChat.Data.Mapping
{
    internal sealed class ChatMessageMap : IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.ToTable("ChatMessage");
            builder.HasKey(i => i.Id);
            builder.Property(i => i.Id).ValueGeneratedOnAdd();

            builder.Property(i => i.Title)
                .IsRequired(false)
                .HasMaxLength(DomainConstants.TitleMaxLength);
            
            builder.Property(i => i.Text)
                .IsRequired(false);

            builder.HasOne(i => i.Customer)
                .WithMany()
                .IsRequired(false)
                .HasForeignKey(i => i.CustomerId);

            builder.HasOne(i => i.ParentMessage)
                .WithMany()
                .IsRequired(false)
                .HasForeignKey(i => i.ParentMessageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
