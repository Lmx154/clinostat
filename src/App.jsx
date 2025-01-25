import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useSensorStream } from "./components/BackendCalls";

function App() {
  const { sensorValue, isStreaming, error, startStream } = useSensorStream();

  return (
    <div className="container">
      <h1>Sensor Monitor</h1>
      
      <div className="row">
        <button onClick={startStream} disabled={isStreaming}>
          {isStreaming ? "Streaming..." : "Start Stream"}
        </button>
        
        <div className="sensor-value">
          Current Value: {sensorValue ?? "No data"}
        </div>
        
        {error && (
          <div className="error">
            Error: {error.toString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
