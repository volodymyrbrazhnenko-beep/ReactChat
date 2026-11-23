using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.RegularExpressions;

namespace ReactChat.Server.Models
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
    public sealed class AllowedChatTextAttribute : ValidationAttribute
    {
        private static readonly Dictionary<string, string> PairedTags = new(StringComparer.Ordinal)
        {
            ["<code>"] = "code",
            ["<i>"] = "i",
            ["<strong>"] = "strong"
        };
        private static readonly Regex EncodedEntityPattern = new(
            @"&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);",
            RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is null)
            {
                return ValidationResult.Success;
            }

            if (value is not string text || !ContainsOnlyAllowedMarkup(text))
            {
                return new ValidationResult(ErrorMessage ?? "Text may contain only links, code, italic, bold, and line-break tags.");
            }

            return ValidationResult.Success;
        }

        private static bool ContainsOnlyAllowedMarkup(string text)
        {
            var openTags = new Stack<string>();
            var position = 0;

            while (position < text.Length)
            {
                var opening = text.IndexOf('<', position);
                if (opening < 0)
                {
                    break;
                }

                var closing = text.IndexOf('>', opening + 1);
                if (closing < 0)
                {
                    return false;
                }

                var token = text[opening..(closing + 1)];
                if (token == "<br />")
                {
                    position = closing + 1;
                    continue;
                }
                else if (token == "</a>")
                {
                    if (openTags.Count == 0 || openTags.Pop() != "a")
                    {
                        return false;
                    }
                }
                else if (PairedTags.TryGetValue(token, out var tagName))
                {
                    openTags.Push(tagName);
                }
                else if (token.StartsWith("<a ", StringComparison.Ordinal) && IsValidAnchor(token, out var href))
                {
                    if (openTags.Contains("a") || !IsSafeHref(href))
                    {
                        return false;
                    }
                    openTags.Push("a");
                }
                else if (token is "</code>" or "</i>" or "</strong>")
                {
                    var closingTagName = token[2..^1];
                    if (openTags.Count == 0 || openTags.Pop() != closingTagName)
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }

                position = closing + 1;
            }

            return openTags.Count == 0;
        }

        private static bool IsValidAnchor(string token, out string href)
        {
            href = string.Empty;
            const string prefix = "<a href=\"";
            if (!token.StartsWith(prefix, StringComparison.Ordinal))
            {
                return false;
            }

            var hrefEnd = token.IndexOf('"', prefix.Length);
            if (hrefEnd < 0 || hrefEnd == prefix.Length || token.AsSpan(hrefEnd).StartsWith("\">"))
            {
                return false;
            }

            const string titlePrefix = " title=\"";
            if (!token.AsSpan(hrefEnd).StartsWith(titlePrefix, StringComparison.Ordinal))
            {
                return false;
            }

            var titleStart = hrefEnd + titlePrefix.Length;
            var titleEnd = token.IndexOf('"', titleStart);
            if (titleEnd < 0 || titleEnd != token.Length - 2 || token[^1] != '>')
            {
                return false;
            }

            href = token[prefix.Length..hrefEnd];
            return true;
        }

        private static bool IsSafeHref(string value)
        {
            var href = WebUtility.HtmlDecode(value);
            if (string.IsNullOrWhiteSpace(href)
                || EncodedEntityPattern.IsMatch(href)
                || href.Any(char.IsControl)
                || href.Contains('\\'))
            {
                return false;
            }

            if (Uri.TryCreate(href, UriKind.Absolute, out var absoluteUri))
            {
                return absoluteUri.Scheme is "http" or "https" or "mailto";
            }

            return Uri.TryCreate(href, UriKind.Relative, out _);
        }
    }
}
