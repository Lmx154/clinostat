import { useState, useEffect, useCallback } from 'react';
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
                    // Update to store the entire array of RPM values
                    setSensorValue(event.payload.values);
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

export const usePresetManager = () => {
    const [presets, setPresets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadPresets = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const presetList = await invoke('read_presets');
            setPresets(Array.isArray(presetList) ? presetList : []);
        } catch (err) {
            setError(err);
            console.error('Failed to load presets:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addPreset = async (rpm) => {
        setIsLoading(true);
        try {
            await invoke('add_preset', { rpm: parseInt(rpm) });
            await loadPresets();
        } catch (err) {
            setError(err);
            console.error('Failed to add preset:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePreset = async (rpm) => {
        setIsLoading(true);
        try {
            await invoke('delete_preset', { rpm: parseInt(rpm) });
            await loadPresets();
        } catch (err) {
            setError(err);
            console.error('Failed to delete preset:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPresets();
    }, [loadPresets]);

    return {
        presets,
        isLoading,
        error,
        addPreset,
        deletePreset
    };
};
