import { useEffect, useState } from 'react';
import Loading from './Loading';

function ChatPage({ id, onBack, onAddMessage }) {
    const [messages, setMessages] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        const controller = new AbortController();

        async function loadMessages() {
            setMessages(undefined);
            setError(undefined);

            if (!id || !/^\d+$/.test(id)) {
                setError('Invalid chat ID.');
                return;
            }

            try {
                const response = await fetch(`/api/chat/GetMessages/${encodeURIComponent(id)}`, {
                    signal: controller.signal
                });
                if (response.status === 404) {
                    throw new Error('Chat not found.');
                }
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                setMessages(await response.json());
            } catch (requestError) {
                if (!controller.signal.aborted) {
                    setError(requestError.message);
                }
            }
        }

        loadMessages();
        return () => controller.abort();
    }, [id]);

    if (error) {
        return (
            <div className="page">
                <p className="status-message error" role="alert">Unable to load chat: {error}</p>
                <button type="button" className="secondary-button" onClick={onBack}>Back to Chat Titles</button>
            </div>
        );
    }

    if (!messages) {
        return <Loading message="Loading chat..." />;
    }

    return (
        <div className="page">
            <div className="page-heading">
                <h1>Chat</h1>
                <button type="button" className="secondary-button" onClick={onBack}>Back to Chat Titles</button>
            </div>
            <div className="table-wrapper">
                <table className="data-grid chat-message-grid">
                    <tbody>
                        {messages.map(message => (
                            <tr key={message.id} className={message.id === Number(id) ? 'root-message' : ''}>
                                <td>
                                    <div>
                                        <span className="chat-id">
                                            {message.id}
                                        </span>
                                        <span className="chat-user">
                                            {message.userName}
                                        </span>
                                        <time dateTime={message.createdOnUtc} className="chat-time">
                                            {new Date(message.createdOnUtc).toLocaleString()}
                                        </time>
                                        <button type="button" name="add-message" onClick={() => onAddMessage(message.id)}>Add Message</button>
                                    </div>
                                    <div className="chat-message-text">
                                        {message.text}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ChatPage;
