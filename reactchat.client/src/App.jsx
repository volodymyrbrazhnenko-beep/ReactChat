import { useEffect, useState } from 'react';
import './App.css';

function Loading({ message = 'Loading...' }) {
    return <p className="status-message"><em>{message}</em></p>;
}

function WeatherPage() {
    const [forecasts, setForecasts] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        async function populateWeatherData() {
            try {
                const response = await fetch('/weatherforecast');
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                setForecasts(await response.json());
            } catch (requestError) {
                setError(requestError.message);
            }
        }

        populateWeatherData();
    }, []);

    if (error) {
        return <p className="status-message error" role="alert">Unable to load weather data: {error}</p>;
    }

    if (!forecasts) {
        return <Loading message="Loading weather forecast..." />;
    }

    return (
        <div className="page">
            <h1>Weather forecast</h1>
            <div className="table-wrapper">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Temp. (C)</th>
                            <th>Temp. (F)</th>
                            <th>Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forecasts.map(forecast => (
                            <tr key={forecast.date}>
                                <td>{forecast.date}</td>
                                <td>{forecast.temperatureC}</td>
                                <td>{forecast.temperatureF}</td>
                                <td>{forecast.summary}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

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
                            <th>Created On (UTC)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {titles.map(title => (
                            <tr key={title.id}>
                                <td>{title.id}</td>
                                <td>{title.customerId}</td>
                                <td>{title.userName}</td>
                                <td>{title.title}</td>
                                <td>{new Date(title.createdOnUtc).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

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
