import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { renderChatText } from './chatText';
import Loading from './Loading';

function ChatTitlesPage({ onAdd, onOpenChat }) {
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
        return <div className="alert alert-danger" role="alert">Unable to load chat titles: {error}</div>;
    }

    if (!pageData) {
        return <Loading message="Loading chat titles..." />;
    }

    const pageCount = Math.max(1, Math.ceil(pageData.totalCount / pageData.pageSize));
    const sortIndicator = column => sortBy === column ? (sortDirection === 'asc' ? '▲' : '▼') : '';

    return (
        <div className="page">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <h1 className="h2 mb-0">Chat Titles</h1>
                <button type="button" className="btn btn-primary" onClick={onAdd}>Add Chat Title</button>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th aria-sort={sortBy === 'userName' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="btn btn-link sort-button p-0 text-decoration-none text-reset" onClick={() => handleSort('userName')}>
                                    User Name {sortIndicator('userName')}
                                </button>
                            </th>
                            <th aria-sort={sortBy === 'email' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="btn btn-link sort-button p-0 text-decoration-none text-reset" onClick={() => handleSort('email')}>
                                    eMail {sortIndicator('email')}
                                </button>
                            </th>
                            <th aria-sort={sortBy === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="btn btn-link sort-button p-0 text-decoration-none text-reset" onClick={() => handleSort('title')}>
                                    Title {sortIndicator('title')}
                                </button>
                            </th>
                            <th aria-sort={sortBy === 'createdOnUtc' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                <button type="button" className="btn btn-link sort-button p-0 text-decoration-none text-reset" onClick={() => handleSort('createdOnUtc')}>
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
                                        <button
                                            type="button"
                                            className="btn btn-link title-link p-0 text-start"
                                            onClick={() => onOpenChat(title.id)}
                                        >
                                            {title.title}
                                        </button>
                                        {typeof title.text === 'string' && title.text.trim() !== '' && (
                                            <button
                                                type="button"
                                                className="btn btn-sm title-text-toggle"
                                                aria-label={`${expandedTitleIds.has(title.id) ? 'Hide' : 'Show'} text for ${title.title}`}
                                                aria-expanded={expandedTitleIds.has(title.id)}
                                                aria-controls={`chat-title-text-${title.id}`}
                                                onClick={() => toggleTitleText(title.id)}
                                            >
                                                <FontAwesomeIcon
                                                    icon={expandedTitleIds.has(title.id) ? faChevronDown : faChevronRight}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {typeof title.text === 'string' && title.text.trim() !== '' && (
                                        <div
                                            id={`chat-title-text-${title.id}`}
                                            className="title-text"
                                            hidden={!expandedTitleIds.has(title.id)}
                                        >
                                            {renderChatText(title.text)}
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
            <div className="d-flex align-items-center justify-content-center gap-3 mt-3" aria-label="Chat titles pagination">
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setPageNumber(currentPage => currentPage - 1)}
                    disabled={isLoading || pageNumber <= 1}
                >
                    Previous
                </button>
                <span>Page {pageData.pageNumber} of {pageCount} ({pageData.totalCount} records)</span>
                <button
                    type="button"
                    className="btn btn-outline-primary"
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
