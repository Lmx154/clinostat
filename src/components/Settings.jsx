import React, { useState } from 'react';

const Settings = ({ isOpen, onClose, onApplyPreset, presets, isLoading, addPreset, deletePreset }) => {
    const [newPresetRpm, setNewPresetRpm] = useState('');
    const [newPresetName, setNewPresetName] = useState('');
    const [isAddingPreset, setIsAddingPreset] = useState(false);
    const [error, setError] = useState('');

    const handleAddPreset = async () => {
        if (!newPresetRpm || !newPresetName || isLoading) return;
        
        try {
            await addPreset(newPresetName, Number(newPresetRpm));
            setNewPresetRpm('');
            setNewPresetName('');
            setIsAddingPreset(false);
        } catch (error) {
            setError(error.toString());
            console.error('Failed to add preset:', error);
        }
    };

    const handleApplyPreset = (rpm) => {
        onApplyPreset(rpm);  // This will now update both the motor and input field
        onClose();
    };

    const handleDeletePreset = async (rpm) => {
        try {
            await deletePreset(rpm);
        } catch (error) {
            console.error('Failed to delete preset:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddPreset();
        } else if (e.key === 'Escape') {
            setIsAddingPreset(false);
        }
    };

    // Prevent modal from closing while loading
    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="bg-gray-100/95 rounded-lg p-6 w-80 max-h-[80vh] relative shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                <svg 
                    onClick={handleClose}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer drop-shadow-md transition-colors duration-200"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                    />
                </svg>

                <h2 className="text-2xl font-bold mb-4">Presets</h2>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {presets.map((preset, index) => (
                        <div 
                            key={`${preset.rpm}-${index}`}
                            className="preset-item p-2 border rounded flex justify-between items-center"
                        >
                            <span onClick={() => !isLoading && handleApplyPreset(preset.rpm)} 
                                  className={`cursor-pointer flex-grow ${isLoading ? 'opacity-50' : ''}`}>
                                {preset.name} ({preset.rpm} RPM)
                            </span>
                            <button 
                                onClick={() => handleDeletePreset(preset.rpm)}
                                disabled={isLoading}
                                className={`ml-2 text-red-500 hover:text-red-700 
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => setIsAddingPreset(true)} 
                    className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Add Preset
                </button>

                {isAddingPreset && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !isLoading) {
                                setIsAddingPreset(false);
                            }
                        }}
                    >
                        <div className="bg-gray-100/95 rounded-lg p-6 w-80 max-h-[80vh] relative shadow-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-4">Add Preset</h2>
                            
                            {error && (
                                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                            
                            <input 
                                type="text"
                                placeholder="Preset Name"
                                value={newPresetName}
                                onChange={(e) => {
                                    setError('');
                                    setNewPresetName(e.target.value);
                                }}
                                disabled={isLoading}
                                className="w-full mb-2 p-2 border rounded"
                                autoFocus
                            />
                            <input 
                                type="number" 
                                placeholder="RPM" 
                                value={newPresetRpm} 
                                onChange={(e) => setNewPresetRpm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="w-full mb-2 p-2 border rounded"
                            />
                            <button 
                                onClick={handleAddPreset} 
                                disabled={isLoading || !newPresetRpm || !newPresetName}
                                className={`w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                                    {(isLoading || !newPresetRpm || !newPresetName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SystemSettings = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div 
                className="bg-gray-100/95 rounded-lg p-6 w-80 max-h-[80vh] relative shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                <svg 
                    onClick={onClose}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer drop-shadow-md transition-colors duration-200"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                    />
                </svg>

                <h2 className="text-2xl font-bold mb-4">System Settings</h2>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    <div className="setting-item">
                        <h3 className="text-lg font-semibold">System Setting 1</h3>
                        <input type="text" className="w-full p-2 border rounded" />
                    </div>
                    <div className="setting-item">
                        <h3 className="text-lg font-semibold">System Setting 2</h3>
                        <input type="text" className="w-full p-2 border rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
export { SystemSettings };
