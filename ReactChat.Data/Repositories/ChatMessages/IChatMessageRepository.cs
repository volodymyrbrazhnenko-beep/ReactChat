using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Domain;

namespace ReactChat.Data.Repositories.ChatMessages
{
    public interface IChatMessageRepository : IBaseRepository<ChatMessage>
    {
        Task<Customer> GetCustomerByEmailAsync(string email);
        Task<ChatMessageView> GetCustomerViewAsync(int id);
        Task<List<CustomerView>> GetCustomerViewsAsync();
    }
}
