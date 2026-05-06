import { useState, useEffect } from 'react';

// Custom hook to fetch hourly weather data for given latitude and longitude.
const useHourly = (lat, lon) => {
    const [dataH, setData] = useState(null);
    const [errorH, setError] = useState(null);

    useEffect(() => {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return;
        }

        // Asynchronous function to fetch data from the weather API.
        const fetchData = async () => {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,precipitation,wind_gusts_10m&hourly=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability,soil_moisture_0_to_1cm&past_hours=3&forecast_hours=12&timezone=auto`);
                if (!response.ok) throw new Error('Weather data fetching failed');
                const json = await response.json();
                setData(json); // Update state with fetched data.
            } catch (err) {
                setError(err.toString()); // Update state with any error that occurs during fetching.
            } 
        };
        fetchData();
    }, [lat, lon]); // Dependencies for useEffect, re-fetch if lat or lon changes.
    
    return { dataH, errorH }; // Return the fetched data and any error state.
};
export default useHourly;
