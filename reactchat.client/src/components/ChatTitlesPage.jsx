import { useEffect, useState } from 'react';
import Loading from './Loading';

function ChatTitlesPage() {
    const [titles, setTitles] = useState();
    const [error, setError] = useState();
    const [expandedTitleIds, setExpandedTitleIds] = useState(() => new Set());

    function toggleTitleText(titleId) {
        setExpandedTitleIds(currentIds => {
            const nextIds = new Set(currentIds);
            if (nextIds.has(titleId)) {
                nextIds.delete(titleId);
            } else {
                nextIds.add(titleId);
            }
            return nextIds;
        });
    }

    useEffect(() => {
        async function populateChatTitles() {
            try {
                const response = await fetch('/api/chat/GetTitles');
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                setTitles(await response.json());
            } catch (requestError) {
                setError(requestError.message);
            }
        }

        populateChatTitles();
    }, []);

    if (error) {
        return <p className="status-message error" role="alert">Unable to load chat titles: {error}</p>;
    }

    if (!titles) {
        return <Loading message="Loading chat titles..." />;
    }

    return (
        <div className="page">
            <h1>Chat Titles</h1>
            <div className="table-wrapper">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Title</th>
                            <th>Created On (Local Time)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {titles.map(title => (
                            <tr key={title.id}>
                                <td>{title.id}</td>
                                <td>{title.userName}</td>
                                <td>
                                    <div className="title-heading">
                                        <span>{title.title}</span>
                                        {typeof title.text === 'string' && title.text.trim() !== '' && (
                                            <button
                                                type="button"
                                                className="title-text-toggle"
                                                aria-label={`${expandedTitleIds.has(title.id) ? 'Hide' : 'Show'} text for ${title.title}`}
                                                aria-expanded={expandedTitleIds.has(title.id)}
                                                aria-controls={`chat-title-text-${title.id}`}
                                                onClick={() => toggleTitleText(title.id)}
                                            >
                                                <span aria-hidden="true">{expandedTitleIds.has(title.id) ? '▼' : '▶'}</span>
                                            </button>
                                        )}
                                    </div>
                                    {typeof title.text === 'string' && title.text.trim() !== '' && (
                                        <div
                                            id={`chat-title-text-${title.id}`}
                                            className="title-text"
                                            hidden={!expandedTitleIds.has(title.id)}
                                        >
                                            {title.text}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <time dateTime={title.createdOnUtc}>
                                        {new Date(title.createdOnUtc).toLocaleString()}
                                    </time>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ChatTitlesPage;
