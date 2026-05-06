import { useState, useEffect } from 'react';

const formatCoordinateFallback = (lat, lon) => `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

const resolveAreaName = (address = {}) =>
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.suburb ||
    address.county ||
    address.state;

// Custom hook to return a readable location label for the current coordinates.
const useLocationName = (lat, lon) => {
    const [locationName, setData] = useState(null); // State to store the location name.
    const [errorLN, setError] = useState(null); // State to store any errors that occur during data fetching.

    useEffect(() => {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return;
        }

        const controller = new AbortController();

        const fetchLocationName = async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) throw new Error('Location data fetching failed');
                const json = await response.json();
                const areaName = resolveAreaName(json?.address);

                setError(null);
                setData([
                    {
                        name: areaName || json?.name || json?.display_name || formatCoordinateFallback(lat, lon),
                    },
                ]);
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }

                setError(err.toString());
                setData([
                    {
                        name: formatCoordinateFallback(lat, lon),
                    },
                ]);
            }
        };

        fetchLocationName();

        return () => {
            controller.abort();
        };
    }, [lat, lon]); // Effect will re-run if latitude or longitude values change.

    return { locationName, errorLN }; // Expose locationName and errorLN for external use.
};

export default useLocationName;
