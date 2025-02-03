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

const BAUD_RATE: u32 = 115200;

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
        println!("Testing port: {}", port_name);
        if let Ok(_) = crate::serial::open_serial(port_name.clone(), BAUD_RATE, serial_connection.clone()).await {
            let is_valid = {
                let mut port = serial_connection.port.lock().unwrap();
                if let Some(port) = port.as_mut() {
                    println!("Starting validation for port: {}", port_name);
                    validate_data_format(port)
                } else {
                    println!("❌ No port available for validation");
                    false
                }
            };

            if is_valid {
                println!("✅ Port validated successfully: {}", port_name);
                if let Ok(port) = serial_connection.port.lock().unwrap().as_mut().unwrap().try_clone() {
                    let window_clone = window.clone();
                    let stop_flag = serial_connection.stop_flag.clone();
                    std::thread::spawn(move || {
                        crate::data_operations::parse_and_emit_rpm(port, window_clone, stop_flag);
                    });
                }
                return Ok(format!("Connected successfully to {}", port_name));
            } else {
                println!("❌ Port validation failed: {}", port_name);
                let _ = crate::serial::close_serial(serial_connection.clone()).await;
            }
        }
    }

    Err("No valid serial connection found".to_string())
}

fn validate_data_format(port: &mut Box<dyn SerialPort + Send>) -> bool {
    println!("Starting validation...");
    
    let start_time = Instant::now();
    let mut buffer = [0u8; 128];
    let mut accum = String::new();

    while start_time.elapsed() < Duration::from_secs(5) {
        match port.read(&mut buffer) {
            Ok(n) => {
                if let Ok(data) = String::from_utf8(buffer[..n].to_vec()) {
                    accum.push_str(&data);
                    println!("Accumulating: {}", data.trim());
                    if accum.contains("RPM") {
                        println!("✅ Validation successful - found RPM data");
                        return true;
                    }
                }
            }
            Err(e) if e.kind() == ErrorKind::WouldBlock => {
                std::thread::sleep(Duration::from_millis(50));
                continue;
            }
            Err(e) => {
                println!("❌ Validation read error: {}", e);
                return false;
            }
        }
    }
    println!("❌ Validation failed - timeout reached");
    false
}