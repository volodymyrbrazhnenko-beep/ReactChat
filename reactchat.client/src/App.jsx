import { useEffect, useState } from 'react';
import ChatTitlesPage from './components/ChatTitlesPage';
import WeatherPage from './components/WeatherPage';
import './App.css';

function App() {
    const [activePage, setActivePage] = useState(() =>
        window.location.hash === '#weather' ? 'weather' : 'chatTitles'
    );

    useEffect(() => {
        function handleHashChange() {
            setActivePage(window.location.hash === '#weather' ? 'weather' : 'chatTitles');
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <>
            <nav className="top-menu" aria-label="Main navigation">
                <a
                    className={activePage === 'chatTitles' ? 'active' : ''}
                    href="#chat-titles"
                >
                    Chat Titles
                </a>
                <a
                    className={activePage === 'weather' ? 'active' : ''}
                    href="#weather"
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
