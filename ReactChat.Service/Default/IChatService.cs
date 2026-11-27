using ReactChat.Data.Repositories.ChatMessages.Views;

namespace ReactChat.Services
{
    public interface IChatService
    {
        Task<TitlePageView> GetTitleViewsAsync(string sortBy, bool ascending, int pageNumber, int pageSize);
        Task<List<ChatMessageView>> GetChatMessagesAsync(int rootMessageId);
        Task<byte[]?> GetCustomerIconAsync(int customerId);
        Task<bool> SetCustomerIconAsync(int customerId, byte[]? icon);
        Task<int> AddTitleAsync(string email, string userName, string title, string? text);
        Task<(int MessageId, int RootMessageId)?> AddMessageAsync(int parentMessageId, string email, string userName, string text);
    }
}
