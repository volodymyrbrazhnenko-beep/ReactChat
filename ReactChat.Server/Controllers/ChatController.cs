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

        [HttpPost("AddTitle")]
        public async Task<IActionResult> AddTitle([FromBody] AddChatTitleRequest request)
        {
            await _chatService.AddTitleAsync(request.Email, request.UserName, request.Title, request.Text);
            return NoContent();
        }
    }
}
