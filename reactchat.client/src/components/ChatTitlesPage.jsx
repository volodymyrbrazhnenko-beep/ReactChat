import { useEffect, useState } from 'react';
import Loading from './Loading';

function ChatTitlesPage({ onAdd }) {
    const [pageData, setPageData] = useState();
    const [error, setError] = useState();
    const [pageNumber, setPageNumber] = useState(1);
    const [sortBy, setSortBy] = useState('createdOnUtc');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isLoading, setIsLoading] = useState(true);
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

    function handleSort(column) {
        setSortDirection(currentDirection => (
            sortBy === column && currentDirection === 'asc' ? 'desc' : 'asc'
        ));
        setSortBy(column);
        setPageNumber(1);
    }

    useEffect(() => {
        const controller = new AbortController();

        async function populateChatTitles() {
            setIsLoading(true);
            setError(undefined);

            try {
                const query = new URLSearchParams({ sortBy, sortDirection, pageNumber });
                const response = await fetch(`/api/chat/GetTitles?${query}`, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                setPageData(await response.json());
            } catch (requestError) {
                if (!controller.signal.aborted) {
                    setError(requestError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        populateChatTitles();
        return () => controller.abort();
    }, [pageNumber, sortBy, sortDirection]);

    if (error) {
        return <p className="status-message error" role="alert">Unable to load chat titles: {error}</p>;
    }

    if (!pageData) {
        return <Loading message="Loading chat titles..." />;
    }

    const pageCount = Math.max(1, Math.ceil(pageData.totalCount / pageData.pageSize));
    const sortIndicator = column => sortBy === column ? (sortDirection === 'asc' ? '▲' : '▼') : '';

    return (
        <div className="page">
            <div className="page-heading">
                <h1>Chat Titles</h1>
                <button type="button" className="primary-button" onClick={onAdd}>Add Chat Title</button>
            </div>
            <div className="table-wrapper">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th aria-sort={sortBy === 'userName' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="sort-button" onClick={() => handleSort('userName')}>
                                    User Name {sortIndicator('userName')}
                                </button>
                            </th>
                            <th aria-sort={sortBy === 'email' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="sort-button" onClick={() => handleSort('email')}>
                                    eMail {sortIndicator('email')}
                                </button>
                            </th>
                            <th aria-sort={sortBy === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="sort-button" onClick={() => handleSort('title')}>
                                    Title {sortIndicator('title')}
                                </button>
                            </th>
                            <th aria-sort={sortBy === 'createdOnUtc' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="sort-button" onClick={() => handleSort('createdOnUtc')}>
                                    Created On (Local Time) {sortIndicator('createdOnUtc')}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.items.map(title => (
                            <tr key={title.id}>
                                <td>{title.id}</td>
                                <td>{title.userName}</td>
                                <td>{title.email}</td>
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
                        {pageData.items.length === 0 && (
                            <tr><td colSpan="5">No chat titles found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" aria-label="Chat titles pagination">
                <button
                    type="button"
                    onClick={() => setPageNumber(currentPage => currentPage - 1)}
                    disabled={isLoading || pageNumber <= 1}
                >
                    Previous
                </button>
                <span>Page {pageData.pageNumber} of {pageCount} ({pageData.totalCount} records)</span>
                <button
                    type="button"
                    onClick={() => setPageNumber(currentPage => currentPage + 1)}
                    disabled={isLoading || pageNumber >= pageCount}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default ChatTitlesPage;
