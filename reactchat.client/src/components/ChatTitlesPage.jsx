import { useEffect, useState } from 'react';
import Loading from './Loading';

function ChatTitlesPage() {
    const [titles, setTitles] = useState();
    const [error, setError] = useState();

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
                            <th>Customer ID</th>
                            <th>User Name</th>
                            <th>Title</th>
                            <th>Created On (Local Time)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {titles.map(title => (
                            <tr key={title.id}>
                                <td>{title.id}</td>
                                <td>{title.customerId}</td>
                                <td>{title.userName}</td>
                                <td>{title.title}</td>
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
