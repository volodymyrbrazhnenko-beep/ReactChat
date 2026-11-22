using ReactChat.Data.Repositories.ChatMessages.Views;

namespace ReactChat.Services
{
    public interface IChatService
    {
        Task<TitlePageView> GetTitleViewsAsync(string sortBy, bool ascending, int pageNumber, int pageSize);
    }
}
