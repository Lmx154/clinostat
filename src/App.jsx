import React, { useState, useEffect } from 'react';
import { MotorBox } from './components/UI';
import { SystemSettings } from './components/Settings';
import { useSensorStream, writeSerial, usePresetManager } from './components/BackendCalls';
import { NavBar } from './components/NavBar';
import wallpaper from '/wallpaper.svg';
import "./App.css";
import { RPMChart } from './components/Chart';

function App() {
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  // State to store RPM input for each motor (motorId: 1 and 2)
  const [motorInputs, setMotorInputs] = useState({ 1: '', 2: '' });
  const { sensorValue, isStreaming, error, startStream, stopStream } = useSensorStream();
  const { presets, isLoading, addPreset, deletePreset } = usePresetManager();
  const [motorData, setMotorData] = useState([]);

  // Handler for input change (for each motor)
  const handleRpmChange = (motorId, value) => {
    setMotorInputs(prev => ({ ...prev, [motorId]: value }));
  };

  // Handler for confirming a change from a given motor
  const handleMotorConfirm = async (motorId) => {
    // Build command using the current inputs for motor 1 and 2
    const rpm1 = motorInputs[1] || 0;
    const rpm2 = motorInputs[2] || 0;
    const command = `SET RPM1=${rpm1} ; RPM2=${rpm2}\n`;
    await writeSerial(command);
  };

  const handleConnectionToggle = async (e) => {
    try {
      if (e.target.checked) {
        setMotorData([]); // Clear existing data when connecting
        await startStream();
      } else {
        await stopStream();
        setMotorData([]); // Clear data when disconnecting
      }
    } catch (err) {
      console.error("Connection toggle error:", err);
    }
  };

  // Update motor data when sensor value changes
  useEffect(() => {
    if (sensorValue !== null && isStreaming) {
      console.log('Processing sensor value:', sensorValue); // Debug log
      const newDataPoint = {
        timestamp: new Date().getTime(), // Use current timestamp in milliseconds
        rpm1: Number(sensorValue.values[0]), // Ensure these are numbers
        rpm2: Number(sensorValue.values[1])
      };
      setMotorData(prev => {
        console.log('Updated chart data:', [...prev.slice(-9), newDataPoint]); // Debug log
        return [...prev.slice(-9), newDataPoint];
      });
    }
  }, [sensorValue, isStreaming]);

  return (
    <div 
      className="min-h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat relative z-0" 
      style={{ 
        backgroundImage: `url(${wallpaper})`,
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <div className="grid-container">
        <div className="mt-8 grid grid-cols-1 gap-6 place-items-center px-6 pb-20">
          <div className="w-full max-w-4xl">
            <RPMChart motorData={motorData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
            {Array.from({ length: 2 }, (_, i) => {
              const motorId = i + 1;
              return (
                <MotorBox 
                  key={motorId} 
                  motorId={motorId}
                  title={`Motor ${motorId}`} 
                  isConnected={isStreaming}
                  sensorValue={sensorValue !== null ? sensorValue.values[motorId - 1] : "-"}
                  rpm={motorInputs[motorId]}
                  onRpmChange={(value) => handleRpmChange(motorId, value)}
                  onConfirm={() => handleMotorConfirm(motorId)}
                  onApplyPreset={(value) => handlePresetApply(motorId, value)}
                  presets={presets}
                  isLoading={isLoading}
                  addPreset={addPreset}
                  deletePreset={deletePreset}
                />
              );
            })}
          </div>
        </div>
      </div>

      <NavBar 
        error={error}
        isStreaming={isStreaming}
        onConnectionToggle={handleConnectionToggle}
        onOpenSettings={() => setIsSystemSettingsOpen(true)}
      />

      <SystemSettings 
        isOpen={isSystemSettingsOpen}
        onClose={() => setIsSystemSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
