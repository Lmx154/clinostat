//! Mock serial data generator for development and testing
//! Simulates sensor readings at 4Hz (4 times per second)

use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tauri::Emitter;

/// Represents a single sensor reading with timestamp and value
/// Implements serialization for Tauri event emission
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SensorReading {
    /// Unix timestamp in seconds
    timestamp: u64,
    /// Sensor value between 0-100
    value: i32,
}

/// Generates a random integer within the specified range (inclusive)
/// 
/// # Arguments
/// * `min` - Minimum value of range
/// * `max` - Maximum value of range
fn random_int(min: i32, max: i32) -> i32 {
    use rand::Rng;
    rand::thread_rng().gen_range(min..=max)
}

/// Adds random noise to a base value
/// 
/// # Arguments
/// * `value` - Base value to add noise to
/// * `magnitude` - Maximum deviation (+/-) from base value
fn add_noise(value: i32, magnitude: i32) -> i32 {
    value + random_int(-magnitude, magnitude)
}

/// Streams mock sensor data to the frontend at 4Hz
/// 
/// # Arguments
/// * `window` - Tauri window instance for event emission
/// 
/// Emits events:
/// * "sensor-reading" - Contains SensorReading with timestamp and value
/// * Breaks loop if emission fails
#[tauri::command]
pub async fn stream_sensor_data(window: tauri::Window) {
    loop {
        // Get current Unix timestamp
        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Create reading with base value of 50 and noise of +/- 50
        let reading = SensorReading {
            timestamp,
            value: add_noise(50, 50), // Results in values between 0-100
        };

        // Emit reading to frontend
        if let Err(e) = window.emit("sensor-reading", &reading) {
            eprintln!("Failed to emit reading: {:?}", e);
            break;
        }

        // Wait 250ms (4Hz) before next reading
        tokio::time::sleep(tokio::time::Duration::from_millis(250)).await;
    }
}
