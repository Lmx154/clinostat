//Here we are parsing the data incoming from the open serial port and sending to the front end (if necessary)
//use an emitter to send the parsed data to the front end
//data_operations.rs
use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tauri::{Window, Emitter};
use std::io::Read;
use serialport::SerialPort;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};  // Fixed import path for AtomicBool

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RpmReading {
    timestamp: String,  // Changed to String to store the formatted timestamp
    values: [u16; 2],
}

// Change signature to take ownership of port directly
pub fn parse_and_emit_rpm(
    mut port: Box<dyn SerialPort + Send>, 
    window: Window, 
    stop_flag: Arc<AtomicBool>
) {
    let mut buffer = [0u8; 1024];
    let mut accumulated = String::new();

    println!("Starting RPM parser...");

    while !stop_flag.load(Ordering::SeqCst) {
        match port.read(&mut buffer) {
            Ok(n) if n > 0 => {
                if let Ok(data) = String::from_utf8(buffer[..n].to_vec()) {
                    accumulated.push_str(&data);
                    
                    // Process complete lines
                    while let Some(newline_pos) = accumulated.find('\n') {
                        let current_line = accumulated[..newline_pos].trim().to_string();
                        accumulated = accumulated[newline_pos + 1..].to_string();

                        // Parse timestamp and RPM values
                        if let Some(timestamp_end) = current_line.find("RPM1:") {
                            let timestamp = current_line[1..timestamp_end].trim().to_string();
                            let data_part = &current_line[timestamp_end..];
                            
                            let parts: Vec<&str> = data_part.split(';').collect();
                            if parts.len() == 2 {
                                let rpm1_str = parts[0].trim().strip_prefix("RPM1:").unwrap_or("").trim();
                                let rpm2_str = parts[1].trim().strip_prefix("RPM2:").unwrap_or("").trim();
                                
                                if let (Ok(rpm1_val), Ok(rpm2_val)) = (rpm1_str.parse::<u16>(), rpm2_str.parse::<u16>()) {
                                    let reading = RpmReading {
                                        timestamp,
                                        values: [rpm1_val, rpm2_val],
                                    };

                                    if let Err(e) = window.emit("rpm-reading", &reading) {
                                        eprintln!("Failed to emit RPM reading: {:?}", e);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {
                if stop_flag.load(Ordering::SeqCst) {
                    println!("Stop flag detected, stopping parser");
                    break;
                }
                continue;
            }
            Err(e) => {
                eprintln!("Error reading from port: {}", e);
                break;
            }
            _ => {}
        }
    }
    println!("RPM parser stopped");
}
