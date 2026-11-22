import { useEffect, useState } from 'react';
import AddChatTitle from './components/AddChatTitle';
import ChatTitlesPage from './components/ChatTitlesPage';
import WeatherPage from './components/WeatherPage';
import './App.css';

function pageForPath(path) {
    if (path === '/weather') {
        return 'weather';
    }

    return path === '/add-chat-title' ? 'addChatTitle' : 'chatTitles';
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

    function navigate(event, page) {
        event?.preventDefault();
        const path = page === 'weather' ? '/weather' : page === 'addChatTitle' ? '/add-chat-title' : '/chat-titles';

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
                {activePage === 'chatTitles' && <ChatTitlesPage onAdd={() => navigate(null, 'addChatTitle')} />}
                {activePage === 'addChatTitle' && <AddChatTitle onCancel={() => navigate(null, 'chatTitles')} />}
                {activePage === 'weather' && <WeatherPage />}
            </main>
        </>
    );
}

export default App;
