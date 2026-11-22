namespace ReactChat.Data.Repositories.ChatMessages.Views
{
    public class TitlePageView
    {
        public required List<TitleView> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
