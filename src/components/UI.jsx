import React from 'react';

const MotorBox = ({ title = "Motor" }) => {
    return (
        <div className="motor-box border-2 border-gray-300 rounded-lg p-4 w-48 h-48 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex flex-col space-y-2">
                <input 
                    type="text" 
                    className="border rounded px-2 py-1 text-center w-24"
                    placeholder="Value 1"
                />
                <input 
                    type="text" 
                    className="border rounded px-2 py-1 text-center w-24"
                    placeholder="Value 2"
                />
            </div>
        </div>
    );
};

export { MotorBox };
