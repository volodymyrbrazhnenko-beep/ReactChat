using Microsoft.EntityFrameworkCore;
using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Data.Uow;
using ReactChat.Domain;

namespace ReactChat.Data.Repositories.ChatMessages
{
    public sealed class ChatMessageRepository : BaseRepository<ChatMessage>, IChatMessageRepository
    {
        private readonly IUnitOfWork _uow;

        public ChatMessageRepository(ApplicationDbContext context, IUnitOfWork uow) : base(context)
        {
            _uow = uow;
        }

        public async Task<List<TitleView>> GetTitleViewsAsync()
        {
            return await Source
                .Where(item => item.Title != null)
                .Where(item => item.ParentMessageId == null)
                .Select(item => new TitleView
                {
                    Id = item.Id,
                    CustomerId = item.CustomerId,
                    UserName = item.Customer.UserName,
                    Title = item.Title ?? string.Empty,
                    CreatedOnUtc = item.CreatedOnUtc
                })
                .OrderByDescending(item => item.CreatedOnUtc)
                .ToListAsync();
        } 
    }
}
