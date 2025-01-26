import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core"; // Tauri API calls
import { listen } from '@tauri-apps/api/event'; // Tauri API calls for listeners

export const useSensorStream = () => {
    const [sensorValue, setSensorValue] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unlisten;

        const setupListener = async () => {
            try {
                // Setup listener for sensor readings
                unlisten = await listen('sensor-reading', (event) => {
                    setSensorValue(event.payload.value);
                });
            } catch (err) {
                setError(err);
            }
        };

        setupListener();

        // Cleanup listener on component unmount
        return () => {
            if (unlisten) unlisten();
        };
    }, []);

    const startStream = async () => {
        try {
            const result = await invoke('establish_connection');
            console.log('Connection result:', result);
            setIsStreaming(true);
        } catch (err) {
            console.error('Connection error:', err);
            setError(err);
            setIsStreaming(false);
        }
    };

    return {
        sensorValue,
        isStreaming,
        error,
        startStream
    };
};
