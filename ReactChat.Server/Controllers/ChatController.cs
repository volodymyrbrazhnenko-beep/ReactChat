using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactChat.Data.Repositories.ChatMessages.Views;
using ReactChat.Data.Repositories.Customers.Views;
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
        public async Task<ActionResult<IEnumerable<TitleView>>> GetTitles()
        {
            var titles = await _chatService.GetTitleViewsAsync();
            return Ok(titles);
        }
    }
}
