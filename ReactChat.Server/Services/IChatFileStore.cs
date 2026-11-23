using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Server.Models;

namespace ReactChat.Server.Services
{
    public interface IChatFileStore
    {
        Task<IReadOnlyList<PreparedChatFile>> PrepareAsync(IReadOnlyList<IFormFile> files, CancellationToken cancellationToken);
        Task SaveAsync(int messageId, IReadOnlyList<PreparedChatFile> files, CancellationToken cancellationToken);
        IReadOnlyList<ChatFileView> GetFiles(int messageId);
        string? GetFilePath(int messageId, string fileName);
    }
}
