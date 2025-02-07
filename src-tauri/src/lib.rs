mod serial;
mod link;
mod data_operations;
mod file_operations;

use serial::SerialConnection;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let serial_connection = SerialConnection {
        port: Mutex::new(None),
        stop_flag: Arc::new(AtomicBool::new(false)),
    };

    // Initialize presets file when the application starts
    if let Err(e) = file_operations::initialize_presets() {
        eprintln!("Failed to initialize presets: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(serial_connection)
        .invoke_handler(tauri::generate_handler![
            // Serial commands
            serial::list_serial_ports,
            serial::open_serial,
            serial::close_serial,
            serial::write_serial,
            // Link commands
            link::establish_connection,
            // File operation commands - explicitly listing all parameters
            file_operations::initialize_presets,
            file_operations::read_presets,
            file_operations::add_preset,
            file_operations::delete_preset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
