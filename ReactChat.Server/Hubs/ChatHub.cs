using Microsoft.AspNetCore.SignalR;
using ReactChat.Services;

namespace ReactChat.Server.Hubs
{
    public sealed class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task JoinChat(int rootMessageId)
        {
            if (rootMessageId <= 0 || (await _chatService.GetChatMessagesAsync(rootMessageId)).Count == 0)
            {
                throw new HubException("Chat not found.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(rootMessageId));
        }

        public static string GetGroupName(int rootMessageId) => $"chat-{rootMessageId}";
    }
}
