//file to read serial port data
//need functions to do the following
//list available serial ports
//open serial port (receive ALL values from ESP32 as a constant data stream)
//write to serial port (send NEW RPM value to ESP32)
//close serial port (stop receiving data)

use serialport::SerialPort;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::State;
use std::io::Write; // ensure Write trait is in scope

/// Holds the serial port plus a stop flag for any spawned threads.
pub struct SerialConnection {
    /// The actual serial port, if open
    pub port: Mutex<Option<Box<dyn SerialPort + Send>>>,
    /// A flag to indicate the parsing thread should stop
    pub stop_flag: Arc<AtomicBool>,
}

/// Lists all available serial ports on the system
#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<String>, String> {
    match serialport::available_ports() {
        Ok(ports) => Ok(ports.iter().map(|p| p.port_name.clone()).collect()),
        Err(e) => Err(format!("Failed to list ports: {}", e)),
    }
}

/// Opens a new serial connection at the specified port/baud rate
#[tauri::command]
pub async fn open_serial(
    port_name: String,
    baud_rate: u32,
    serial_connection: State<'_, SerialConnection>,
) -> Result<String, String> {
    println!("Attempting to open port: {} at {} baud", port_name, baud_rate);

    // 1) Reset the stop flag in case it was set by a previous `close_serial`.
    serial_connection
        .stop_flag
        .store(false, Ordering::Relaxed);
    println!("Stop flag reset");

    // 2) Check if there's already an open connection
    let mut connection = serial_connection.port.lock().unwrap();
    println!("Got mutex lock");

    if connection.is_some() {
        println!("Error: Port already open");
        return Err("A serial connection is already open".to_string());
    }

    // 3) Attempt to open the port
    println!("Creating new serial port connection...");
    match serialport::new(&port_name, baud_rate)
        .data_bits(serialport::DataBits::Eight)
        .stop_bits(serialport::StopBits::One)
        .parity(serialport::Parity::None)
        .timeout(Duration::from_secs(5))  // Longer timeout
        .open()
    {
        Ok(port) => {
            println!("Successfully opened port");
            *connection = Some(port);
            let message = format!("Connected to {} at {} baud", port_name, baud_rate);
            println!("Success: {}", message);
            Ok(message)
        }
        Err(e) => {
            println!("Failed to open port: {}", e);
            Err(format!("Failed to connect: {}", e))
        }
    }
}

/// Closes the currently active serial connection and signals the parser thread to stop
#[tauri::command]
pub async fn close_serial(
    serial_connection: State<'_, SerialConnection>,
) -> Result<String, String> {
    // Set stop flag before acquiring the lock to ensure parser sees it
    serial_connection
        .stop_flag
        .store(true, Ordering::SeqCst);  // Changed to SeqCst for stricter ordering

    std::thread::sleep(std::time::Duration::from_millis(100));  // Give parser time to stop

    {
        let mut connection = serial_connection.port.lock().unwrap();
        if connection.is_none() {
            return Err("No active serial connection to close".to_string());
        }
        *connection = None;
    }

    Ok("Serial port closed successfully".to_string())
}

#[tauri::command]
pub async fn write_serial(state: State<'_, SerialConnection>, command: String) -> Result<(), String> {
    // Expected command example: "SET RPM1=500 ; RPM2=800"
    let mut port_lock = state.port.lock().map_err(|_| "Mutex poisoned".to_string())?;
    if let Some(ref mut port) = *port_lock {
        port.write_all(command.as_bytes())
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Serial port not open".into())
    }
}
