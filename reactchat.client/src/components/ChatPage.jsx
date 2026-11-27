import { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { renderChatText } from './chatText';
import ChangeIcon from './ChangeIcon';
import Loading from './Loading';
import CodeFilePreview, { isCodeFile } from './CodeFilePreview';

function mergeMessages(currentMessages, incomingMessages) {
    const messagesById = new Map((currentMessages ?? []).map(message => [message.id, message]));
    incomingMessages.forEach(message => messagesById.set(message.id, message));

    return [...messagesById.values()].sort((first, second) => {
        if (first.parentMessageId == null) return second.parentMessageId == null ? 0 : -1;
        if (second.parentMessageId == null) return 1;
        return new Date(second.createdOnUtc) - new Date(first.createdOnUtc) || second.id - first.id;
    });
}

function ChatPage({ id, onBack, onAddMessage }) {
    const [chatState, setChatState] = useState(() => ({ id, messages: undefined, error: undefined }));
    const [customerToChangeIcon, setCustomerToChangeIcon] = useState();
    const [iconVersion, setIconVersion] = useState(0);
    const messages = chatState.id === id ? chatState.messages : undefined;
    const error = !id || !/^\d+$/.test(id)
        ? 'Invalid chat ID.'
        : chatState.id === id ? chatState.error : undefined;

    useEffect(() => {
        const controller = new AbortController();
        let isActive = true;
        let connection;

        if (!id || !/^\d+$/.test(id)) {
            return () => {
                isActive = false;
                controller.abort();
            };
        }

        async function loadMessages() {
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

                const loadedMessages = await response.json();
                if (isActive) {
                    setChatState(current => ({
                        id,
                        messages: mergeMessages(current.id === id ? current.messages : undefined, loadedMessages),
                        error: undefined
                    }));
                }
            } catch (requestError) {
                if (isActive && !controller.signal.aborted) {
                    setChatState({ id, messages: undefined, error: requestError.message });
                }
            }
        }

        async function connectToChat() {
            connection = new HubConnectionBuilder()
                .withUrl('/hubs/chat')
                .withAutomaticReconnect()
                .build();

            connection.on('MessageAdded', message => {
                if (isActive) {
                    setChatState(current => ({
                        id,
                        messages: mergeMessages(current.id === id ? current.messages : undefined, [message]),
                        error: undefined
                    }));
                }
            });
            connection.onreconnected(async () => {
                if (!isActive) return;

                try {
                    await connection.invoke('JoinChat', Number(id));
                } catch (connectionError) {
                    console.error('Unable to rejoin the chat after reconnecting.', connectionError);
                }
            });

            try {
                await connection.start();
                if (isActive) {
                    await connection.invoke('JoinChat', Number(id));
                }
            } catch (connectionError) {
                if (isActive) {
                    console.error('Unable to connect to live chat updates.', connectionError);
                }
            }
        }

        async function initialize() {
            await connectToChat();
            if (isActive) {
                await loadMessages();
            }
        }

        initialize();
        return () => {
            isActive = false;
            controller.abort();
            if (connection) {
                connection.stop().catch(connectionError => {
                    console.error('Unable to stop the live chat connection.', connectionError);
                });
            }
        };
    }, [id]);

    if (error) {
        return (
            <div className="page">
                <div className="alert alert-danger" role="alert">Unable to load chat: {error}</div>
                <button type="button" className="btn btn-secondary" onClick={onBack}>Back to Chat Titles</button>
            </div>
        );
    }

    if (!messages || messages[0]?.id !== Number(id)) {
        return <Loading message="Loading chat..." />;
    }

    return (
        <div className="page">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <h2 className="h2 mb-0">{messages[0].title}</h2>
                <button type="button" className="btn btn-secondary" onClick={onBack}>Back to Chat Titles</button>
            </div>
            {customerToChangeIcon && (
                <ChangeIcon
                    customerId={customerToChangeIcon.id}
                    hasIcon={customerToChangeIcon.hasIcon}
                    onClose={() => setCustomerToChangeIcon(undefined)}
                    onChanged={hasIcon => {
                        setChatState(current => current.id !== id || !current.messages ? current : {
                            ...current,
                            messages: current.messages.map(message => (
                                message.customerId === customerToChangeIcon.id ? { ...message, isIcon: hasIcon } : message
                            ))
                        });
                        setIconVersion(version => version + 1);
                    }}
                />
            )}
            <div className="table-responsive">
                <table className="table table-striped align-middle chat-message-grid">
                    <tbody>
                        {messages.map(message => (
                            <tr key={message.id} className={message.id === Number(id) ? 'root-message' : ''}>
                                <td className="chat-message-cell" style={{ '--message-indent': `${message.parentMessageId == null ? 0 : 2}rem` }}>
                                    <div>
                                        <span className="chat-id">
                                            {message.id}
                                        </span>
                                        <button
                                            type="button"
                                            className="chat-customer-icon"
                                            aria-label={`Change icon for ${message.userName}`}
                                            title="Change customer icon"
                                            onClick={() => setCustomerToChangeIcon({ id: message.customerId, hasIcon: message.isIcon })}
                                        >
                                            {message.isIcon ? (
                                                <img
                                                    src={`/api/chat/CustomerIcon/${message.customerId}?v=${iconVersion}`}
                                                    alt=""
                                                    width="80"
                                                    height="80"
                                                />
                                            ) : (
                                                <FontAwesomeIcon icon={faComments} aria-hidden="true" />
                                            )}
                                        </button>
                                        <span className="chat-user">
                                            {message.userName}
                                        </span>
                                        <time dateTime={message.createdOnUtc} className="chat-time">
                                            {new Date(message.createdOnUtc).toLocaleString()}
                                        </time>
                                        <button type="button" className="chat-add-message-button" name="add-message" title="Add Message" aria-label="Add Message" onClick={() => onAddMessage(message.id)}>
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                    </div>
                                    <div className="chat-message-text">
                                        {renderChatText(message.text)}
                                    </div>
                                    {message.files?.length > 0 && (
                                        <div className="chat-message-files" aria-label="Message attachments">
                                            {message.files.map(file => (
                                                <div key={file.name} className="chat-message-file">
                                                    {file.isImage ? (
                                                        <a href={file.url} target="_blank" rel="noreferrer" aria-label={`Open ${file.name}`}>
                                                            <img src={file.url} alt={file.name} loading="lazy" />
                                                        </a>
                                                    ) : isCodeFile(file.name) ? (
                                                        <CodeFilePreview file={file} />
                                                    ) : (
                                                        <a href={file.url} download={file.name}>{file.name}</a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
