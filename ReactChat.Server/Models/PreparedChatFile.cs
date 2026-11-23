namespace ReactChat.Server.Models
{
    public sealed class PreparedChatFile
    {
        public required string Name { get; init; }
        public required string ContentType { get; init; }
        public required byte[] Content { get; init; }
        public required bool IsImage { get; init; }
    }
}
