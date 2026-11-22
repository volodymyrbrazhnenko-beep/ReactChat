namespace ReactChat.Data.Repositories.ChatMessages.Views
{
    public class TitleView
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public required string UserName { get; set; }
        public required string Title { get; set; }
        public string? Text { get; set; }
        public DateTime CreatedOnUtc { get; set; }
    }
}
