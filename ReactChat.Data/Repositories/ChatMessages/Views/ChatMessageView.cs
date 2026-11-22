namespace ReactChat.Data.Repositories.ChatMessages.Views
{
    public class ChatMessageView
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int? ParentMessageId { get; set; }
        public required DateTime CreatedOnUtc { get; set; }
        public string? Title { get; set; }
        public string? Text { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public bool IsIcon { get; set; }
    }
}
