import { useState } from "react";
import { MotorBox } from "./components/UI";
import { SystemSettings } from "./components/Settings";
import { useSensorStream } from './components/BackendCalls';
import { NavBar } from './components/NavBar';
import wallpaper from '/wallpaper.svg';  
import "./App.css";

function App() {
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  const { sensorValue, isStreaming, error, startStream, stopStream } = useSensorStream();

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
      }}
    >
      {/* Center the grid container */}
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center px-6 pb-20">
          {/* Only render two motor boxes */}
          {Array.from({ length: 2 }, (_, i) => (
            <MotorBox 
              key={i} 
              title={`Motor ${i + 1}`} 
              isConnected={isStreaming}
              sensorValue={sensorValue}
            />
          ))}
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

