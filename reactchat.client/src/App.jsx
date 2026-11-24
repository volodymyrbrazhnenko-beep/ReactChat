import { useEffect, useState } from 'react';
import AddChatTitle from './components/AddChatTitle';
import AddMessage from './components/AddMessage';
import ChatTitlesPage from './components/ChatTitlesPage';
import ChatPage from './components/ChatPage';
import AboutPage from './components/AboutPage';
import './App.css';

function pageForPath(path) {
    if (path === '/about') {
        return 'about';
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
        const path = page === 'about'
            ? '/about'
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
        <div className="app-shell">
            <nav className="navbar navbar-expand navbar-dark bg-primary shadow-sm" aria-label="Main navigation">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/chat-titles" onClick={event => navigate(event, 'chatTitles')}>
                        ReactChat
                    </a>
                    <div className="navbar-nav">
                        <a
                            className={`nav-link ${['chatTitles', 'chat', 'addChatTitle', 'addMessage'].includes(activePage) ? 'active' : ''}`}
                            href="/chat-titles"
                            onClick={event => navigate(event, 'chatTitles')}
                        >
                            Chat Titles
                        </a>
                        <a
                            className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
                            href="/about"
                            onClick={event => navigate(event, 'about')}
                        >
                            About
                        </a>
                    </div>
                </div>
            </nav>
            <main className="container-fluid py-4">
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
                {activePage === 'about' && <AboutPage />}
            </main>
        </div>
    );
}

export default App;
