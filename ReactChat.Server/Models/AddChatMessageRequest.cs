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
        [RegularExpression("^[A-Z][A-Za-z0-9]*$", ErrorMessage = "User Name must start with a capital Latin letter and contain only Latin letters or digits.")]
        [MaxLength(DomainConstants.UserNameMaxLength)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [AllowedChatText]
        public string Text { get; set; } = string.Empty;
    }
}
