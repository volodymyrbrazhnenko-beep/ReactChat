using System.ComponentModel.DataAnnotations;
using ReactChat.Domain;

namespace ReactChat.Server.Models
{
    public sealed class AddChatTitleRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(DomainConstants.EmailMaxLength)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(DomainConstants.UserNameMaxLength)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(DomainConstants.TitleMaxLength)]
        public string Title { get; set; } = string.Empty;

        public string? Text { get; set; }
    }
}
