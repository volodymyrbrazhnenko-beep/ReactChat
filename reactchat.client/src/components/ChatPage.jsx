import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { renderChatText } from './chatText';
import ChangeIcon from './ChangeIcon';
import Loading from './Loading';
import CodeFilePreview, { isCodeFile } from './CodeFilePreview';

function ChatPage({ id, onBack, onAddMessage }) {
    const [messages, setMessages] = useState();
    const [error, setError] = useState();
    const [customerToChangeIcon, setCustomerToChangeIcon] = useState();
    const [iconVersion, setIconVersion] = useState(0);

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
                <h2 className="h2 mb-0">{messages[0].title}</h2>
                <button type="button" className="btn btn-secondary" onClick={onBack}>Back to Chat Titles</button>
            </div>
            {customerToChangeIcon && (
                <ChangeIcon
                    customerId={customerToChangeIcon.id}
                    hasIcon={customerToChangeIcon.hasIcon}
                    onClose={() => setCustomerToChangeIcon(undefined)}
                    onChanged={hasIcon => {
                        setMessages(currentMessages => currentMessages.map(message => (
                            message.customerId === customerToChangeIcon.id ? { ...message, isIcon: hasIcon } : message
                        )));
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
