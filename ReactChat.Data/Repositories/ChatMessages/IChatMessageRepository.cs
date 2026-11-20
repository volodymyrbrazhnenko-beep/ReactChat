using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Domain;

namespace ReactChat.Data.Repositories.ChatMessages
{
    public interface IChatMessageRepository : IBaseRepository<ChatMessage>
    {
        Task<List<TitleView>> GetTitleViewsAsync();
    }
}
