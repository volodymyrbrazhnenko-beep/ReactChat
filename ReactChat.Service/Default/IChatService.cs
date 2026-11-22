using ReactChat.Data.Repositories.ChatMessages.Views;

namespace ReactChat.Services
{
    public interface IChatService
    {
        Task<List<TitleView>> GetTitleViewsAsync();
    }
}
