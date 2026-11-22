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

        public async Task<TitlePageView> GetTitleViewsAsync(string sortBy, bool ascending, int pageNumber, int pageSize)
        {
            return await _uow.ChatMessageRepository.GetTitleViewsAsync(sortBy, ascending, pageNumber, pageSize);
        }

    }
}
