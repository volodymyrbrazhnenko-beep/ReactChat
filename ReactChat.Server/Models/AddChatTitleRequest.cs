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
        [RegularExpression("^[A-Z][A-Za-z0-9]*$", ErrorMessage = "User Name must start with a capital Latin letter and contain only Latin letters or digits.")]
        [MaxLength(DomainConstants.UserNameMaxLength)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(DomainConstants.TitleMaxLength)]
        public string Title { get; set; } = string.Empty;

        public string? Text { get; set; }
    }
}
