import React, { useState } from 'react';
import Settings from './Settings';
import { writeSerial } from './BackendCalls';  // <-- New import

const MotorBox = ({ title = "Motor", isConnected = false, sensorValue = null }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [motorTitle, setMotorTitle] = useState(title);
    const [rpm, setRpm] = useState('');
    const [rpm2] = useState(0); // Constant state for RPM2 starting at 0

    const handleApplyPreset = (preset) => {
        setMotorTitle(preset.title);
        setRpm(preset.rpm);
    };

    const handleConfirm = async () => {
        const command = `SET RPM1=${rpm} ; RPM2=${rpm2}\n`; // ADD \n
        await writeSerial(command);
    };

    return (
        <div className="motor-box rounded-lg p-4 w-auto min-w-[20rem] h-48 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-gray-50 to-gray-100/90 shadow-lg relative border border-gray-200/50">
            {/* Status Indicator with Cog Assembly */}
            <div className="absolute top-3 right-3 flex items-center gap-0 text-sm">
                <div className="flex items-start scale-75 mr-1">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className={`w-7 h-7 ${isConnected ? '[animation:spin_1s_linear_infinite] text-green-500' : 'text-red-500'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                    </svg>
                    <div className="relative">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className={`w-6 h-6 -ml-2 mt-1 ${isConnected ? '[animation:spin_1s_linear_infinite_reverse] text-green-500' : 'text-red-500'}`}
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" 
                            />
                        </svg>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className={`w-5 h-5 absolute -top-2 -left-2 ${isConnected ? '[animation:spin_1s_linear_infinite] text-green-500' : 'text-red-500'}`}
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" 
                            />
                        </svg>
                    </div>
                </div>
                <span className="text-gray-600 -ml-2">
                    {isConnected ? 'Online' : 'Offline'}
                </span>
            </div>

            <h3 className="text-lg font-semibold">{motorTitle}</h3>
            <div className="flex flex-row items-start space-x-4">
                <div className="flex flex-col items-center space-y-1">
                    <span className="text-sm text-gray-600">Input</span>
                    <div className="flex">
                        <input 
                            type="text" 
                            className="border rounded px-1 py-1 text-center w-20"
                            placeholder="Value 1"
                            value={rpm}
                            onChange={(e) => setRpm(e.target.value)}
                        />
                        <button 
                            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={handleConfirm}
                        >
                            Confirm
                        </button>
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
            <svg 
                onClick={() => setIsSettingsOpen(true)}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="w-5 h-5 fixed-position cursor-pointer opacity-60 hover:opacity-100 transition-transform duration-300 hover:rotate-90"
                style={{ position: 'absolute', bottom: '8px', right: '8px' }}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>

            <Settings 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                onApplyPreset={handleApplyPreset}
            />
        </div>
    );
};

export { MotorBox };
