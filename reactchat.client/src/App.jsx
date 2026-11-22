import { useEffect, useState } from 'react';
import AddChatTitle from './components/AddChatTitle';
import AddMessage from './components/AddMessage';
import ChatTitlesPage from './components/ChatTitlesPage';
import ChatPage from './components/ChatPage';
import WeatherPage from './components/WeatherPage';
import './App.css';

function pageForPath(path) {
    if (path === '/weather') {
        return 'weather';
    }

    if (path === '/add-chat-title') {
        return 'addChatTitle';
    }

    if (/^\/chat\/[^/]+\/add-message\/[^/]+\/?$/.test(path)) {
        return 'addMessage';
    }

    if (path.startsWith('/chat/')) {
        return 'chat';
    }

    return 'chatTitles';
}

function chatIdForPath(path) {
    const match = /^\/chat\/([^/]+)(?:\/add-message\/[^/]+)?\/?$/.exec(path);
    return match ? decodeURIComponent(match[1]) : null;
}

function parentMessageIdForPath(path) {
    const match = /^\/chat\/[^/]+\/add-message\/([^/]+)\/?$/.exec(path);
    return match ? decodeURIComponent(match[1]) : null;
}

function App() {
    const [activePage, setActivePage] = useState(() => pageForPath(window.location.pathname));

    useEffect(() => {
        function handlePopState() {
            setActivePage(pageForPath(window.location.pathname));
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    function navigate(event, page, id, parentMessageId) {
        event?.preventDefault();
        const path = page === 'weather'
            ? '/weather'
            : page === 'addChatTitle'
                ? '/add-chat-title'
                : page === 'addMessage'
                    ? `/chat/${encodeURIComponent(id)}/add-message/${encodeURIComponent(parentMessageId)}`
                    : page === 'chat'
                        ? `/chat/${encodeURIComponent(id)}`
                        : '/chat-titles';

        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }

        setActivePage(page);
    }

    return (
        <>
            <nav className="top-menu" aria-label="Main navigation">
                <a
                    className={activePage !== 'weather' ? 'active' : ''}
                    href="/chat-titles"
                    onClick={event => navigate(event, 'chatTitles')}
                >
                    Chat Titles
                </a>
                <a
                    className={activePage === 'weather' ? 'active' : ''}
                    href="/weather"
                    onClick={event => navigate(event, 'weather')}
                >
                    Weather
                </a>
            </nav>
            <main>
                {activePage === 'chatTitles' && (
                    <ChatTitlesPage
                        onAdd={() => navigate(null, 'addChatTitle')}
                        onOpenChat={id => navigate(null, 'chat', id)}
                    />
                )}
                {activePage === 'chat' && (
                    <ChatPage
                        id={chatIdForPath(window.location.pathname)}
                        onBack={() => navigate(null, 'chatTitles')}
                        onAddMessage={parentMessageId => navigate(null, 'addMessage', chatIdForPath(window.location.pathname), parentMessageId)}
                    />
                )}
                {activePage === 'addMessage' && (
                    <AddMessage
                        parentId={parentMessageIdForPath(window.location.pathname)}
                        onCancel={() => navigate(null, 'chat', chatIdForPath(window.location.pathname))}
                    />
                )}
                {activePage === 'addChatTitle' && <AddChatTitle onCancel={() => navigate(null, 'chatTitles')} />}
                {activePage === 'weather' && <WeatherPage />}
            </main>
        </>
    );
}

export default App;
