namespace ReactChat.Domain
{
    public class ChatMessage : BaseEntity
    {
        public required int CustomerId { get; set; }
        public int? ParentMessageId { get; set; }
        public required DateTime CreatedOnUtc { get; set; }
        public string? Title { get; set; }
        public required string Text { get; set; }
        public virtual ChatMessage? ParentMessage { get; set; }
        public virtual required Customer Customer { get; set; }
    }
}
