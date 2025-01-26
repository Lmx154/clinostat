import React from 'react';

const Settings = ({ isOpen, onClose }) => {
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
                
                {/* Add your settings content here */}
                <div className="space-y-4">
                    <div className="setting-item">
                        <h3 className="text-lg font-semibold">Setting 1</h3>
                        <input type="text" className="w-full" />
                    </div>
                    <div className="setting-item">
                        <h3 className="text-lg font-semibold">Setting 2</h3>
                        <input type="text" className="w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
