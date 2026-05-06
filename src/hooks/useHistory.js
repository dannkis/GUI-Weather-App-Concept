import { useState, useEffect } from 'react';

// Custom hook for fetching historical weather data based on latitude and longitude.
const useHistory = (lat, lon) => {
    const [dataHis, setData] = useState(null);
    const [errorHis, setError] = useState(null);

    useEffect(() => {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&past_hours=3&forecast_hours=0&timezone=auto`);
                if (!response.ok) throw new Error('Weather data fetching failed');
                const json = await response.json();
                setData(json); // Set fetched data
            } catch (err) {
                setError(err.toString()); // Set error on failure
            } 
        };
        fetchData();
    }, [lat, lon]); // Dependencies for useEffect

    return { dataHis, errorHis };
};

export default useHistory;
