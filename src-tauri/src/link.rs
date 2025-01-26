//here we will do the connection logic with the appropriate serial port
//first, well have to get a list of the serial ports, then we will open one serial port
//after opening we will verify that the data output of the serial port is in the format that we need
//if the format is correct, keep this serial port open and use it in the parsed data function in dataoperations.rs,
//else if the format is not correct, close the serial port and try the next serial port.

use serialport::SerialPort;
use tauri::State;
use crate::serial::SerialConnection;

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
    let mut buffer = [0; 64];
    
    // Read some data with timeout
    match port.bytes_to_read() {
        Ok(0) => return false,
        Ok(_) => {
            if let Ok(bytes_read) = port.read(&mut buffer) {
                if let Ok(data) = String::from_utf8(buffer[..bytes_read].to_vec()) {
                    // Check if data matches expected format
                    return data.split(',')
                        .all(|s| s.trim().parse::<f64>().is_ok());
                }
            }
        },
        Err(_) => return false
    }
    false
}