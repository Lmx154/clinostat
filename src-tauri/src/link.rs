//here we will do the connection logic with the appropriate serial port
//first, well have to get a list of the serial ports, then we will open one serial port
//after opening we will verify that the data output of the serial port is in the format that we need
//if the format is correct, keep this serial port open and use it in the parsed data function in dataoperations.rs,
//else if the format is not correct, close the serial port and try the next serial port.
//link.rs

use serialport::SerialPort;
use tauri::State;
use crate::serial::SerialConnection;
use std::time::{Duration, Instant};
use std::io::{ErrorKind, Read};

const BAUD_RATE: u32 = 9600;

#[tauri::command]
pub async fn establish_connection(
    window: tauri::Window,
    serial_connection: State<'_, SerialConnection>
) -> Result<String, String> {
    let ports = crate::serial::list_serial_ports()
        .map_err(|e| format!("Failed to list ports: {}", e))?;

    if ports.is_empty() {
        return Err("No ports available".to_string());
    }

    for port_name in ports {
        if let Ok(_) = crate::serial::open_serial(port_name.clone(), BAUD_RATE, serial_connection.clone()).await {
            let is_valid = {
                let mut port = serial_connection.port.lock().unwrap();
                if let Some(port) = port.as_mut() {
                    validate_data_format(port)
                } else {
                    false
                }
            };

            if is_valid {
                // Start the RPM parser in a new thread after validation
                if let Ok(port) = serial_connection.port.lock().unwrap().as_mut().unwrap().try_clone() {
                    let window_clone = window.clone();
                    std::thread::spawn(move || {
                        // Move the port directly into the function
                        crate::data_operations::parse_and_emit_rpm(port, window_clone);
                    });
                }
                return Ok(format!("Connected successfully to {}", port_name));
            }

            let _ = crate::serial::close_serial(serial_connection.clone()).await;
        }
    }

    Err("No valid serial connection found".to_string())
}

fn validate_data_format(port: &mut Box<dyn SerialPort + Send>) -> bool {
    // For debugging, uncomment the next line:
    crate::serial::monitor_serial_data(port);
    
    let start_time = Instant::now();
    let mut buffer = [0u8; 128];  // Increased buffer size
    let mut accum = String::new();

    // Longer timeout (5 seconds)
    while start_time.elapsed() < Duration::from_secs(5) {
        match port.read(&mut buffer) {
            Ok(n) => {
                if let Ok(data) = String::from_utf8(buffer[..n].to_vec()) {
                    accum.push_str(&data);
                    
                    // Handle different line endings and search anywhere in the string
                    if let Some(rpm_index) = accum.find("RPM1: ") {
                        let value_str = &accum[rpm_index+6..];
                        let end = value_str.find(|c| c == '\r' || c == '\n')
                            .unwrap_or_else(|| value_str.len());
                        
                        if value_str[..end].trim().parse::<u16>().is_ok() {
                            println!("Validation successful - correct data format");
                            return true;
                        }
                    }
                }
            }
            Err(e) if e.kind() == ErrorKind::WouldBlock => {
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(e) => {
                println!("Read error: {}", e);
                return false;
            }
        }
    }
    println!("Validation failed - no valid data received");
    false
}