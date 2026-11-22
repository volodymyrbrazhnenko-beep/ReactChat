using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Data.Uow;
using ReactChat.Domain;

namespace ReactChat.Services
{
    public sealed class ChatService : IChatService
    {
        private readonly IUnitOfWork _uow;
        public ChatService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<TitlePageView> GetTitleViewsAsync(string sortBy, bool ascending, int pageNumber, int pageSize)
        {
            return await _uow.ChatMessageRepository.GetTitleViewsAsync(sortBy, ascending, pageNumber, pageSize);
        }

        public async Task AddTitleAsync(string email, string userName, string title, string? text)
        {
            email = email.Trim();
            var customer = await _uow.CustomerRepository.GetCustomerByEmailAsync(email);
            if (customer is null)
            {
                customer = new Customer
                {
                    Email = email,
                    UserName = userName.Trim()
                };
                _uow.CustomerRepository.Add(customer);
            }

            _uow.ChatMessageRepository.Add(new ChatMessage
            {
                CustomerId = customer.Id,
                Customer = customer,
                CreatedOnUtc = DateTime.UtcNow,
                Title = title.Trim(),
                Text = text ?? string.Empty
            });

            await _uow.CompleteAsync();
        }

    }
}
