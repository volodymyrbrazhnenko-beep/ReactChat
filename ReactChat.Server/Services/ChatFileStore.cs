using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Processing;
using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Server.Models;

namespace ReactChat.Server.Services
{
    public sealed class ChatFileStore : IChatFileStore
    {
        private const int MaxFilesPerMessage = 8;
        private const int MaxTextFileSize = 100 * 1024;
        private const int MaxImageWidth = 320;
        private const int MaxImageHeight = 240;
        private readonly string _chatDirectory;

        public ChatFileStore(IWebHostEnvironment environment)
        {
            _chatDirectory = Path.Combine(environment.ContentRootPath, "Chat");
        }

        public async Task<IReadOnlyList<PreparedChatFile>> PrepareAsync(
            IReadOnlyList<IFormFile> files,
            CancellationToken cancellationToken)
        {
            if (files.Count > MaxFilesPerMessage)
            {
                throw new ChatFileValidationException($"A message can have at most {MaxFilesPerMessage} files.");
            }

            var preparedFiles = new List<PreparedChatFile>(files.Count);
            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    throw new ChatFileValidationException("Empty files cannot be uploaded.");
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (extension == ".txt")
                {
                    if (file.Length > MaxTextFileSize)
                    {
                        throw new ChatFileValidationException("Text files must not exceed 100 KB.");
                    }

                    await using var textStream = new MemoryStream();
                    await file.CopyToAsync(textStream, cancellationToken);
                    preparedFiles.Add(CreatePreparedFile(".txt", "text/plain", textStream.ToArray(), false));
                    continue;
                }

                if (extension is not (".jpg" or ".gif" or ".png"))
                {
                    throw new ChatFileValidationException("Only .txt, .jpg, .gif, and .png files are allowed.");
                }

                await using var uploadedImage = new MemoryStream();
                await file.CopyToAsync(uploadedImage, cancellationToken);
                uploadedImage.Position = 0;

                IImageFormat? format;
                try
                {
                    format = Image.DetectFormat(uploadedImage);
                }
                catch (UnknownImageFormatException)
                {
                    throw new ChatFileValidationException("The uploaded image is invalid.");
                }

                var expectedFormat = extension switch
                {
                    ".jpg" => "JPEG",
                    ".gif" => "GIF",
                    ".png" => "PNG",
                    _ => string.Empty
                };
                if (format is null || !string.Equals(format.Name, expectedFormat, StringComparison.OrdinalIgnoreCase))
                {
                    throw new ChatFileValidationException("The image content must match its .jpg, .gif, or .png extension.");
                }

                uploadedImage.Position = 0;
                try
                {
                    using var image = await Image.LoadAsync(uploadedImage, cancellationToken);
                    if (image.Width > MaxImageWidth || image.Height > MaxImageHeight)
                    {
                        image.Mutate(context => context.Resize(new ResizeOptions
                        {
                            Size = new Size(MaxImageWidth, MaxImageHeight),
                            Mode = ResizeMode.Max
                        }));
                    }

                    await using var resizedImage = new MemoryStream();
                    await image.SaveAsync(resizedImage, format, cancellationToken);
                    preparedFiles.Add(CreatePreparedFile(
                        extension,
                        extension switch
                        {
                            ".jpg" => "image/jpeg",
                            ".gif" => "image/gif",
                            ".png" => "image/png",
                            _ => throw new InvalidOperationException("Unsupported image extension.")
                        },
                        resizedImage.ToArray(),
                        true));
                }
                catch (UnknownImageFormatException)
                {
                    throw new ChatFileValidationException("The uploaded image is invalid.");
                }
                catch (InvalidImageContentException)
                {
                    throw new ChatFileValidationException("The uploaded image is invalid.");
                }
            }

            return preparedFiles;
        }

        public async Task SaveAsync(int messageId, IReadOnlyList<PreparedChatFile> files, CancellationToken cancellationToken)
        {
            if (files.Count == 0)
            {
                return;
            }

            var messageDirectory = GetMessageDirectory(messageId);
            Directory.CreateDirectory(messageDirectory);
            foreach (var file in files)
            {
                var path = Path.Combine(messageDirectory, file.Name);
                await System.IO.File.WriteAllBytesAsync(path, file.Content, cancellationToken);
            }
        }

        public IReadOnlyList<ChatFileView> GetFiles(int messageId)
        {
            var messageDirectory = GetMessageDirectory(messageId);
            if (!Directory.Exists(messageDirectory))
            {
                return Array.Empty<ChatFileView>();
            }

            return Directory.EnumerateFiles(messageDirectory)
                .Select(Path.GetFileName)
                .Where(name => name is not null)
                .Select(name => new ChatFileView
                {
                    Name = name!,
                    Url = $"/api/chat/Files/{messageId}/{Uri.EscapeDataString(name!)}",
                    IsImage = IsImageExtension(Path.GetExtension(name!))
                })
                .OrderBy(file => file.Name, StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        public string? GetFilePath(int messageId, string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName)
                || !string.Equals(Path.GetFileName(fileName), fileName, StringComparison.Ordinal)
                || !Guid.TryParse(Path.GetFileNameWithoutExtension(fileName), out _)
                || !IsAllowedExtension(Path.GetExtension(fileName)))
            {
                return null;
            }

            var path = Path.Combine(GetMessageDirectory(messageId), fileName);
            return System.IO.File.Exists(path) ? path : null;
        }

        private string GetMessageDirectory(int messageId) => Path.Combine(_chatDirectory, messageId.ToString(System.Globalization.CultureInfo.InvariantCulture));

        private static PreparedChatFile CreatePreparedFile(string extension, string contentType, byte[] content, bool isImage) => new()
        {
            Name = $"{Guid.NewGuid():N}{extension}",
            ContentType = contentType,
            Content = content,
            IsImage = isImage
        };

        private static bool IsAllowedExtension(string extension) => extension.ToLowerInvariant() is ".txt" or ".jpg" or ".gif" or ".png";

        private static bool IsImageExtension(string extension) => extension.ToLowerInvariant() is ".jpg" or ".gif" or ".png";
    }
}
