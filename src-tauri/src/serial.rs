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

/// Holds the serial port plus a stop flag for any spawned threads.
pub struct SerialConnection {
    /// The actual serial port, if open
    pub port: Mutex<Option<Box<dyn SerialPort + Send>>>,
    /// A flag to indicate the parsing thread should stop
    pub stop_flag: Arc<AtomicBool>,
}

// impl SerialConnection {
//     /// Create a new `SerialConnection` with no open port and `stop_flag=false`
//     pub fn new() -> Self {
//         Self {
//             port: Mutex::new(None),
//             stop_flag: Arc::new(AtomicBool::new(false)),
//         }
//     }
// }

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
    {
        let mut connection = serial_connection.port.lock().unwrap();
        if connection.is_none() {
            return Err("No active serial connection to close".to_string());
        }

        // 1) Set the stop flag so the parsing thread breaks out
        serial_connection
            .stop_flag
            .store(true, Ordering::Relaxed);

        // 2) Drop the actual port handle
        *connection = None;
    }

    Ok("Serial port closed successfully".to_string())
}

/// Internal debug function to monitor serial data in terminal
pub fn monitor_serial_data(port: &mut Box<dyn SerialPort + Send>) {
    let mut buffer = [0u8; 1024];
    println!("Debug monitor started - watching serial data:");
    println!("----------------------------------------");
    
    loop {
        match port.read(&mut buffer) {
            Ok(n) if n > 0 => {
                if let Ok(data) = String::from_utf8(buffer[..n].to_vec()) {
                    print!("{}", data);
                }
            }
            Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {
                continue;
            }
            Err(e) => {
                eprintln!("Error reading from port: {}", e);
                break;
            }
            _ => {}
        }
    }
}

// Usage example - you can add this anywhere you want to debug:
// if let Some(port) = connection.as_mut() {
//     monitor_serial_data(port);
// }