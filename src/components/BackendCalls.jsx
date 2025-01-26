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
                // Update listener to match backend event name
                unlisten = await listen('rpm-reading', (event) => {
                    setSensorValue(event.payload.value); // Access the RPM value from the payload
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

    const stopStream = async () => {
        try {
            await invoke('close_serial');  // Changed from 'close_serial_connection' to 'close_serial'
            setIsStreaming(false);
        } catch (err) {
            console.error('Disconnect error:', err);
            setError(err);
        }
    };

    return {
        sensorValue,
        isStreaming,
        setIsStreaming,  // Export this so App.jsx can control it
        error,
        startStream,
        stopStream  // Add stopStream to the returned object
    };
};
