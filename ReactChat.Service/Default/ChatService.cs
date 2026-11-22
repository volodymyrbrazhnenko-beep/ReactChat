using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Data.Uow;

namespace ReactChat.Services
{
    public sealed class ChatService : IChatService
    {
        private readonly IUnitOfWork _uow;
        public ChatService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<List<TitleView>> GetTitleViewsAsync()
        {
            return await _uow.ChatMessageRepository.GetTitleViewsAsync();
        }

    }
}
