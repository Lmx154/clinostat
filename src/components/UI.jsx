import React, { useState } from 'react';
import Settings from './Settings';

const MotorBox = ({ 
    motorId, 
    title = "Motor", 
    isConnected = false, 
    sensorValue = null, 
    rpm, 
    onRpmChange, 
    onConfirm, 
    onApplyPreset,
    presets,
    isLoading,
    addPreset,
    deletePreset 
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="motor-box rounded-lg p-4 w-auto min-w-[20rem] h-48 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-gray-50 to-gray-100/90 shadow-lg relative border border-gray-200/50">
            {/* Status Indicator - Now in top left */}
            <div className="absolute top-3 left-3 flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">
                    {isConnected ? 'Online' : 'Offline'}
                </span>
            </div>

            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex flex-row items-start space-x-4">
                <div className="flex flex-col items-center space-y-1">
                    <span className="text-sm text-gray-600">Input</span>
                    <div className="flex">
                        <button 
                            className="mr-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                            onClick={onConfirm}
                        >
                            Set
                        </button>
                        <input 
                            type="text" 
                            className="border rounded px-1 py-1 text-center w-20"
                            placeholder="Value 1"
                            value={rpm}
                            onChange={(e) => onRpmChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <span className="text-sm text-gray-600">Actual</span>
                    <input 
                        type="text" 
                        className="border rounded px-1 py-1 text-center w-20"
                        value={sensorValue !== null ? sensorValue : "-"}
                        readOnly
                    />
                </div>
            </div>
            {/* Settings Cog - Now in top right */}
            <svg 
                onClick={() => setIsSettingsOpen(true)}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="w-6 h-6 absolute top-3 right-3 cursor-pointer opacity-60 hover:opacity-100 transition-transform duration-300 hover:rotate-90"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>

            <Settings 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                onApplyPreset={(rpm) => {
                    onRpmChange(rpm.toString());  // Convert RPM to string for input
                    onApplyPreset(rpm);
                }}
                presets={presets}
                isLoading={isLoading}
                addPreset={addPreset}
                deletePreset={deletePreset}
            />
        </div>
    );
};

export { MotorBox };
