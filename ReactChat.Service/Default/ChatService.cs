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

        public async Task<List<ChatMessageView>> GetChatMessagesAsync(int rootMessageId)
        {
            return await _uow.ChatMessageRepository.GetChatMessagesAsync(rootMessageId);
        }

        public async Task<byte[]?> GetCustomerIconAsync(int customerId)
        {
            var customer = await _uow.CustomerRepository.GetEntityAsync(customerId);
            return customer?.Icon;
        }

        public async Task<bool> SetCustomerIconAsync(int customerId, byte[]? icon)
        {
            var customer = await _uow.CustomerRepository.GetEntityAsync(customerId);
            if (customer is null)
            {
                return false;
            }

            customer.Icon = icon;
            customer.IsIcon = icon is not null;
            await _uow.CompleteAsync();
            return true;
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

        public async Task<bool> AddMessageAsync(int parentMessageId, string email, string userName, string text)
        {
            var parentMessage = await _uow.ChatMessageRepository.GetEntityAsync(parentMessageId);
            if (parentMessage is null)
            {
                return false;
            }

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
                ParentMessageId = parentMessageId,
                ParentMessage = parentMessage,
                RootMessageId = parentMessage.RootMessageId ?? parentMessage.Id,
                CreatedOnUtc = DateTime.UtcNow,
                Text = text
            });

            await _uow.CompleteAsync();
            return true;
        }

    }
}
