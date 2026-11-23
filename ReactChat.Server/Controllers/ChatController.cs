using System.Buffers.Binary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Server.Models;
using ReactChat.Services;

namespace ReactChat.Server.Controllers
{
    [AllowAnonymous]
    [Route("api/chat")]
    [Produces("application/json")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private IChatService _chatService;

        private static bool IsValidCustomerIcon(byte[] bytes)
        {
            ReadOnlySpan<byte> pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
            return bytes.AsSpan().StartsWith(pngSignature)
                && BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(16, 4)) == 80
                && BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(20, 4)) == 80;
        }

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
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

        [HttpPost("AddTitle")]
        public async Task<IActionResult> AddTitle([FromBody] AddChatTitleRequest request)
        {
            await _chatService.AddTitleAsync(request.Email, request.UserName, request.Title, request.Text);
            return NoContent();
        }

        [HttpPost("AddMessage")]
        public async Task<IActionResult> AddMessage([FromBody] AddChatMessageRequest request)
        {
            var added = await _chatService.AddMessageAsync(
                request.ParentMessageId,
                request.Email,
                request.UserName,
                request.Text);
            return added ? NoContent() : NotFound("Parent message not found.");
        }
    }
}
