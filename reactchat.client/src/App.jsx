import { useEffect, useState } from 'react';
import ChatTitlesPage from './components/ChatTitlesPage';
import WeatherPage from './components/WeatherPage';
import './App.css';

function App() {
    const [activePage, setActivePage] = useState(() =>
        window.location.pathname === '/weather' ? 'weather' : 'chatTitles'
    );

    useEffect(() => {
        function handlePopState() {
            setActivePage(window.location.pathname === '/weather' ? 'weather' : 'chatTitles');
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    function navigate(event, page) {
        event.preventDefault();
        const path = page === 'weather' ? '/weather' : '/chat-titles';

        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }

        setActivePage(page);
    }

    return (
        <>
            <nav className="top-menu" aria-label="Main navigation">
                <a
                    className={activePage === 'chatTitles' ? 'active' : ''}
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
                {activePage === 'chatTitles' ? <ChatTitlesPage /> : <WeatherPage />}
            </main>
        </>
    );
}

export default App;
