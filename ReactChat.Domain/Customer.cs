namespace ReactChat.Domain
{
    public class Customer: BaseEntity
    {
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public string? HomePage { get; set; }
        public string? Icon { get; set; }
    }
}
