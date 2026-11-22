using System.ComponentModel.DataAnnotations;
using ReactChat.Domain;

namespace ReactChat.Server.Models
{
    public sealed class AddChatMessageRequest
    {
        [Range(1, int.MaxValue)]
        public int ParentMessageId { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(DomainConstants.EmailMaxLength)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(DomainConstants.UserNameMaxLength)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Text { get; set; } = string.Empty;
    }
}
