import React, { useState } from 'react';

const Settings = ({ isOpen, onClose, onApplyPreset }) => {
    const [presets, setPresets] = useState([]);
    const [newPreset, setNewPreset] = useState({ title: '', rpm: '' });
    const [isAddingPreset, setIsAddingPreset] = useState(false);

    const handleAddPreset = () => {
        setPresets([...presets, newPreset]);
        setNewPreset({ title: '', rpm: '' });
        setIsAddingPreset(false);
    };

    const handleApplyPreset = (preset) => {
        onApplyPreset(preset);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div 
                className="bg-gray-100/95 rounded-lg p-6 w-96 relative shadow-lg"
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

                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                
                <div className="space-y-4">
                    {presets.map((preset, index) => (
                        <div 
                            key={index} 
                            className="preset-item p-2 border rounded cursor-pointer hover:bg-gray-200"
                            onClick={() => handleApplyPreset(preset)}
                        >
                            <h3 className="text-lg font-semibold">{preset.title}</h3>
                            <p>RPM: {preset.rpm}</p>
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
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsAddingPreset(false);
                        }}
                    >
                        <div 
                            className="bg-gray-100/95 rounded-lg p-6 w-96 relative shadow-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <svg 
                                onClick={() => setIsAddingPreset(false)}
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

                            <h2 className="text-2xl font-bold mb-4">Add Preset</h2>
                            
                            <input 
                                type="text" 
                                placeholder="Preset Title" 
                                value={newPreset.title} 
                                onChange={(e) => setNewPreset({ ...newPreset, title: e.target.value })} 
                                className="w-full mb-2 p-2 border rounded"
                            />
                            <input 
                                type="number" 
                                placeholder="RPM" 
                                value={newPreset.rpm} 
                                onChange={(e) => setNewPreset({ ...newPreset, rpm: e.target.value })} 
                                className="w-full mb-2 p-2 border rounded"
                            />
                            <button 
                                onClick={handleAddPreset} 
                                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
