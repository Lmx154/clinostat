import { useState, useEffect } from "react";
import { MotorBox } from "./components/UI";
import { SystemSettings } from "./components/Settings";
import { useSensorStream } from './components/BackendCalls';
import { NavBar } from './components/NavBar';
import wallpaper from '/wallpaper.svg';  // Update path to match your project structure
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
        backgroundColor: '#f0f0f0', // Fallback color
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <div className="grid-container">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center px-6 pb-20">
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
        isOpen={isSystemSettingsOpen}        onClose={() => setIsSystemSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
