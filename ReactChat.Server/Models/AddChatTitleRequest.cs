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
        [RegularExpression("^[A-Z][A-Za-z0-9]*(?: [A-Z][A-Za-z0-9]*){0,2}$", ErrorMessage = "User Name must contain one to three words, each starting with a capital Latin letter and containing only Latin letters or digits.")]
        [MaxLength(DomainConstants.UserNameMaxLength)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(DomainConstants.TitleMaxLength)]
        public string Title { get; set; } = string.Empty;

        [AllowedChatText]
        public string? Text { get; set; }

        public List<IFormFile> Files { get; set; } = [];
    }
}
