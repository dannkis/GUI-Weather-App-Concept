import { useState, useEffect } from "react";

// Custom hook for fetching weather data based on latitude and longitude.
const useAPI = (lat, lon) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`,
        );
        if (!response.ok) throw new Error("Weather data fetching failed");
        setData(await response.json());
      } catch (err) {
        setError(err.toString());
      }
    };
    fetchData();
  }, [lat, lon]);

  return { data, error };
};

export default useAPI;
