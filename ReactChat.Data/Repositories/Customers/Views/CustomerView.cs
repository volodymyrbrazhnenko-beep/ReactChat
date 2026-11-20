namespace ReactChat.Data.Repositories.Customers.Views
{
    public sealed class CustomerView
    {
        public int Id { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public bool IsIcon { get; set; }
    }
}
