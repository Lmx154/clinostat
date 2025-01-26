mod serial;
mod link;

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

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(serial_connection)
        .invoke_handler(tauri::generate_handler![
            // TODO: Replace mockserial with real serial data streaming
            serial::list_serial_ports,
            serial::open_serial,
            serial::close_serial,
            link::establish_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
