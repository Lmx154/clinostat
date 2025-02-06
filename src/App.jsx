import { useState } from "react";
import { MotorBox } from "./components/UI";
import { SystemSettings } from "./components/Settings";
import { useSensorStream, writeSerial } from './components/BackendCalls';
import { NavBar } from './components/NavBar';
import wallpaper from '/wallpaper.svg';
import "./App.css";

function App() {
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  // State to store RPM input for each motor (motorId: 1 and 2)
  const [motorInputs, setMotorInputs] = useState({ 1: '', 2: '' });
  const { sensorValue, isStreaming, error, startStream, stopStream } = useSensorStream();

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
        await startStream();
      } else {
        await stopStream();
      }
    } catch (err) {
      console.error("Connection toggle error:", err);
    }
  };

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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center px-6 pb-20">
          {Array.from({ length: 2 }, (_, i) => {
            const motorId = i + 1;
            return (
              <MotorBox 
                key={motorId} 
                motorId={motorId}
                title={`Motor ${motorId}`} 
                isConnected={isStreaming}
                sensorValue={sensorValue !== null ? sensorValue[i] : "-"}
                rpm={motorInputs[motorId]}
                onRpmChange={(value) => handleRpmChange(motorId, value)}
                onConfirm={() => handleMotorConfirm(motorId)}
              />
            );
          })}
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
