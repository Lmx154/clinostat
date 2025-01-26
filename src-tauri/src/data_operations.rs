//Here we are parsing the data incoming from the open serial port and sending to the front end (if necessary)
//use an emitter to send the parsed data to the front end
//data_operations.rs
use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tauri::{Window, Emitter};
use std::io::Read;
use serialport::SerialPort;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RpmReading {
    timestamp: u64,
    value: u16,
}

// Change signature to take ownership of port directly
pub fn parse_and_emit_rpm(mut port: Box<dyn SerialPort + Send>, window: Window) {
    let mut buffer = [0u8; 1024];
    let mut accumulated = String::new();

    println!("Starting RPM parser...");

    loop {
        match port.read(&mut buffer) {
            Ok(n) if n > 0 => {
                if let Ok(data) = String::from_utf8(buffer[..n].to_vec()) {
                    accumulated.push_str(&data);
                    
                    // Process complete lines
                    while let Some(newline_pos) = accumulated.find('\n') {
                        let current_line = accumulated[..newline_pos].trim().to_string();
                        // Remove the processed line from accumulated
                        accumulated = accumulated[newline_pos + 1..].to_string();

                        // Process the current line
                        if let Some(rpm_pos) = current_line.find("RPM1: ") {
                            if let Ok(rpm_value) = current_line[rpm_pos + 6..].trim().parse::<u16>() {
                                let reading = RpmReading {
                                    timestamp: SystemTime::now()
                                        .duration_since(SystemTime::UNIX_EPOCH)
                                        .unwrap()
                                        .as_secs(),
                                    value: rpm_value,
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
            Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => continue,
            Err(e) => {
                eprintln!("Error reading from port: {}", e);
                break;
            }
            _ => {}
        }
    }
}
