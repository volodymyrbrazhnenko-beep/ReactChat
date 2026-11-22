import { useEffect, useState } from 'react';
import Loading from './Loading';

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

export default WeatherPage;
