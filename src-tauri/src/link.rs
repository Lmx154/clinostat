//here we will do the connection logic with the appropriate serial port
//first, well have to get a list of the serial ports, then we will open one serial port
//after opening we will verify that the data output of the serial port is in the format that we need
//if the format is correct, keep this serial port open and use it in the parsed data function in dataoperations.rs,
//else if the format is not correct, close the serial port and try the next serial port.

use serialport::SerialPort;
use tauri::State;
use crate::serial::SerialConnection;
use std::time::{Duration, Instant};
use std::io::{ErrorKind, Read};

const BAUD_RATE: u32 = 9600;


#[tauri::command]
pub async fn establish_connection(
    serial_connection: State<'_, SerialConnection>
) -> Result<String, String> {
    let ports = crate::serial::list_serial_ports()
        .map_err(|e| format!("Failed to list ports: {}", e))?;

    if ports.is_empty() {
        return Err("No ports available".to_string());
    }

    for port_name in ports {
        // Try to open the port with proper arguments
        if let Ok(_) = crate::serial::open_serial(port_name.clone(), BAUD_RATE, serial_connection.clone()).await {
            // Validate in a separate block to ensure MutexGuard is dropped
            let is_valid = {
                let mut port = serial_connection.port.lock().unwrap();
                if let Some(port) = port.as_mut() {
                    validate_data_format(port)
                } else {
                    false
                }
            }; // MutexGuard is dropped here

            if is_valid {
                return Ok(format!("Connected successfully to {}", port_name));
            }

            // If validation fails, close the port
            let _ = crate::serial::close_serial(serial_connection.clone()).await;
        } else {
            println!("Failed to open {}", port_name);
            continue;
        }
    }

    Err("No valid serial connection found".to_string())
}

fn validate_data_format(port: &mut Box<dyn SerialPort + Send>) -> bool {
    // We’ll read in a loop until we either find "RPM1: " or time out
    let start_time = Instant::now();
    let mut buffer = [0u8; 64];
    let mut accum = String::new();

    // We'll wait up to ~2 seconds for valid data
    while start_time.elapsed() < Duration::from_secs(2) {
        match port.read(&mut buffer) {
            Ok(0) => {
                // Nothing read yet, small pause before next read
                std::thread::sleep(Duration::from_millis(50));
            }
            Ok(n) => {
                if let Ok(data) = String::from_utf8(buffer[..n].to_vec()) {
                    accum.push_str(&data);
                    // Check if our accumulated data contains something like "RPM1: 123"
                    if let Some(segment) = accum.strip_prefix("RPM1: ") {
                        if let Some(end_idx) = segment.find('\n') {
                            let raw_num = &segment[..end_idx].trim();
                            if raw_num.parse::<u8>().is_ok() {
                                println!("Valid data found: RPM1: {}", raw_num);
                                return true;
                            }
                        } else if let Ok(_val) = segment.trim().parse::<u8>() {
                            println!("Valid data found: RPM1: {}", segment.trim());
                            return true;
                        }
                    }
                }
            }
            Err(e) => {
                if e.kind() == ErrorKind::WouldBlock {
                    // No data yet
                    std::thread::sleep(Duration::from_millis(50));
                } else {
                    println!("Error reading from port: {}", e);
                    return false;
                }
            }
        }
    }
    false
}