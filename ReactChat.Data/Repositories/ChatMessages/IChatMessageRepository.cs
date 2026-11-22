using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Domain;

namespace ReactChat.Data.Repositories.ChatMessages
{
    public interface IChatMessageRepository : IBaseRepository<ChatMessage>
    {
        Task<TitlePageView> GetTitleViewsAsync(string sortBy, bool ascending, int pageNumber, int pageSize);
        Task<List<ChatMessageView>> GetChatMessagesAsync(int rootMessageId);
    }
}
