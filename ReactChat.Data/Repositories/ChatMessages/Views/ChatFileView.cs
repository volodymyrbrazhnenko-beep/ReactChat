namespace ReactChat.Data.Repositories.ChatMessages.Views
{
    public sealed class ChatFileView
    {
        public required string Name { get; init; }
        public required string Url { get; init; }
        public required bool IsImage { get; init; }
    }
}
