using System.Buffers.Binary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Server.Models;
using ReactChat.Server.Services;
using ReactChat.Services;

namespace ReactChat.Server.Controllers
{
    [AllowAnonymous]
    [Route("api/chat")]
    [Produces("application/json")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IChatFileStore _chatFileStore;

        private static bool IsValidCustomerIcon(byte[] bytes)
        {
            ReadOnlySpan<byte> pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
            return bytes.AsSpan().StartsWith(pngSignature)
                && BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(16, 4)) == 80
                && BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(20, 4)) == 80;
        }

        public ChatController(IChatService chatService, IChatFileStore chatFileStore)
        {
            _chatService = chatService;
            _chatFileStore = chatFileStore;
        }

        [HttpGet("GetTitles", Name = "GetTitles")]
        public async Task<ActionResult<TitlePageView>> GetTitles(
            [FromQuery] string sortBy = "createdOnUtc",
            [FromQuery] string sortDirection = "desc",
            [FromQuery] int pageNumber = 1)
        {
            var normalizedSortBy = sortBy.ToLowerInvariant();
            if (normalizedSortBy is not ("username" or "email" or "title" or "createdonutc"))
            {
                return BadRequest("sortBy must be userName, email, title, or createdOnUtc.");
            }

            var normalizedDirection = sortDirection.ToLowerInvariant();
            if (normalizedDirection is not ("asc" or "desc"))
            {
                return BadRequest("sortDirection must be asc or desc.");
            }

            if (pageNumber < 1)
            {
                return BadRequest("pageNumber must be greater than zero.");
            }

            var titles = await _chatService.GetTitleViewsAsync(
                normalizedSortBy,
                normalizedDirection == "asc",
                pageNumber,
                25);
            return Ok(titles);
        }

        [HttpGet("GetMessages/{rootMessageId:int}", Name = "GetMessages")]
        public async Task<ActionResult<List<ChatMessageView>>> GetMessages(int rootMessageId)
        {
            var messages = await _chatService.GetChatMessagesAsync(rootMessageId);
            if (messages.Count == 0)
            {
                return NotFound();
            }

            foreach (var message in messages)
            {
                message.Files = _chatFileStore.GetFiles(message.Id).ToList();
            }

            return Ok(messages);
        }

        [HttpGet("CustomerIcon/{customerId:int}")]
        public async Task<IActionResult> GetCustomerIcon(int customerId)
        {
            var icon = await _chatService.GetCustomerIconAsync(customerId);
            return icon is null ? NotFound() : File(icon, "image/png");
        }

        [HttpPost("CustomerIcon/{customerId:int}")]
        [RequestSizeLimit(2 * 1024 * 1024)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadCustomerIcon(int customerId, [FromForm] IFormFile? icon)
        {
            const int maxIconSize = 1024 * 1024;
            if (icon is null || icon.Length < 24 || icon.Length > maxIconSize)
            {
                return BadRequest("Upload a PNG image no larger than 1 MB.");
            }

            await using var stream = new MemoryStream();
            await icon.CopyToAsync(stream);
            var bytes = stream.ToArray();
            if (!IsValidCustomerIcon(bytes))
            {
                return BadRequest("Customer icons must be PNG images sized 80 by 80 pixels.");
            }

            var updated = await _chatService.SetCustomerIconAsync(customerId, bytes);
            return updated ? NoContent() : NotFound("Customer not found.");
        }

        [HttpDelete("CustomerIcon/{customerId:int}")]
        public async Task<IActionResult> RemoveCustomerIcon(int customerId)
        {
            var updated = await _chatService.SetCustomerIconAsync(customerId, null);
            return updated ? NoContent() : NotFound("Customer not found.");
        }

        [HttpGet("Files/{messageId:int}/{fileName}")]
        public IActionResult GetChatFile(int messageId, string fileName)
        {
            var path = _chatFileStore.GetFilePath(messageId, fileName);
            if (path is null)
            {
                return NotFound();
            }

            var contentType = Path.GetExtension(fileName).ToLowerInvariant() switch
            {
                ".txt" => "text/plain",
                ".jpg" => "image/jpeg",
                ".gif" => "image/gif",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
            return PhysicalFile(path, contentType);
        }

        [HttpPost("AddTitle")]
        [RequestSizeLimit(64 * 1024 * 1024)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddTitle([FromForm] AddChatTitleRequest request)
        {
            IReadOnlyList<PreparedChatFile> files;
            try
            {
                files = await _chatFileStore.PrepareAsync(request.Files, HttpContext.RequestAborted);
            }
            catch (ChatFileValidationException exception)
            {
                return BadRequest(exception.Message);
            }

            var messageId = await _chatService.AddTitleAsync(request.Email, request.UserName, request.Title, request.Text);
            await _chatFileStore.SaveAsync(messageId, files, HttpContext.RequestAborted);
            return NoContent();
        }

        [HttpPost("AddMessage")]
        [RequestSizeLimit(64 * 1024 * 1024)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddMessage([FromForm] AddChatMessageRequest request)
        {
            IReadOnlyList<PreparedChatFile> files;
            try
            {
                files = await _chatFileStore.PrepareAsync(request.Files, HttpContext.RequestAborted);
            }
            catch (ChatFileValidationException exception)
            {
                return BadRequest(exception.Message);
            }

            var messageId = await _chatService.AddMessageAsync(
                request.ParentMessageId,
                request.Email,
                request.UserName,
                request.Text);
            if (messageId is null)
            {
                return NotFound("Parent message not found.");
            }

            await _chatFileStore.SaveAsync(messageId.Value, files, HttpContext.RequestAborted);
            return NoContent();
        }
    }
}
