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

        public async Task<TitlePageView> GetTitleViewsAsync(string sortBy, bool ascending, int pageNumber, int pageSize)
        {
            var titleQuery = Source
                .Where(item => item.Title != null)
                .Where(item => item.ParentMessageId == null)
                .Select(item => new TitleView
                {
                    Id = item.Id,
                    CustomerId = item.CustomerId,
                    UserName = item.Customer.UserName,
                    Email = item.Customer.Email,
                    Title = item.Title ?? "---",
                    Text = item.Text,
                    CreatedOnUtc = item.CreatedOnUtc
                });

            var totalCount = await titleQuery.CountAsync();
            var orderedTitles = sortBy switch
            {
                "username" => ascending ? titleQuery.OrderBy(item => item.UserName) : titleQuery.OrderByDescending(item => item.UserName),
                "email" => ascending ? titleQuery.OrderBy(item => item.Email) : titleQuery.OrderByDescending(item => item.Email),
                "title" => ascending ? titleQuery.OrderBy(item => item.Title) : titleQuery.OrderByDescending(item => item.Title),
                "createdonutc" => ascending ? titleQuery.OrderBy(item => item.CreatedOnUtc) : titleQuery.OrderByDescending(item => item.CreatedOnUtc),
                _ => throw new ArgumentOutOfRangeException(nameof(sortBy), sortBy, "Unsupported title sort field.")
            };

            var skip = (long)(pageNumber - 1) * pageSize;
            var items = skip >= totalCount
                ? new List<TitleView>()
                : await orderedTitles
                    .ThenBy(item => item.Id)
                    .Skip((int)skip)
                    .Take(pageSize)
                    .ToListAsync();

            return new TitlePageView
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<List<ChatMessageView>> GetChatMessagesAsync(int rootMessageId)
        {
            var rootMessage = await Source
                .Where(item => item.Id == rootMessageId && item.ParentMessageId == null)
                .Select(item => new ChatMessageView
                {
                    Id = item.Id,
                    CustomerId = item.CustomerId,
                    ParentMessageId = item.ParentMessageId,
                    CreatedOnUtc = item.CreatedOnUtc,
                    Title = item.Title,
                    Text = item.Text,
                    UserName = item.Customer.UserName,
                    Email = item.Customer.Email,
                    IsIcon = item.Customer.IsIcon
                })
                .SingleOrDefaultAsync();

            if (rootMessage is null)
            {
                return new List<ChatMessageView>();
            }

            var replies = await Source
                .Where(item => item.RootMessageId == rootMessageId)
                .OrderByDescending(item => item.CreatedOnUtc)
                .ThenByDescending(item => item.Id)
                .Select(item => new ChatMessageView
                {
                    Id = item.Id,
                    CustomerId = item.CustomerId,
                    ParentMessageId = item.ParentMessageId,
                    CreatedOnUtc = item.CreatedOnUtc,
                    Title = item.Title,
                    Text = item.Text,
                    UserName = item.Customer.UserName,
                    Email = item.Customer.Email,
                    IsIcon = item.Customer.IsIcon
                })
                .ToListAsync();

            replies.Insert(0, rootMessage);
            return replies;
        }
    }
}
