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
                <div className="alert alert-danger" role="alert">Unable to load chat: {error}</div>
                <button type="button" className="btn btn-secondary" onClick={onBack}>Back to Chat Titles</button>
            </div>
        );
    }

    if (!messages) {
        return <Loading message="Loading chat..." />;
    }

    return (
        <div className="page">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <h1 className="h2 mb-0">Chat</h1>
                <button type="button" className="btn btn-secondary" onClick={onBack}>Back to Chat Titles</button>
            </div>
            <div className="table-responsive">
                <table className="table table-striped align-middle chat-message-grid">
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
                                        <button type="button" className="btn btn-sm btn-primary" name="add-message" onClick={() => onAddMessage(message.id)}>Add Message</button>
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
