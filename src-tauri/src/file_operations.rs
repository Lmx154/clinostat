use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;

const DEFAULT_PRESETS: [u32; 8] = [25, 50, 75, 100, 125, 150, 175, 200];
const PRESETS_PATH: &str = "../presets.txt";

#[tauri::command]
pub fn initialize_presets() -> Result<(), String> {
    if !Path::new(PRESETS_PATH).exists() {
        let mut file = File::create(PRESETS_PATH).map_err(|e| e.to_string())?;
        for rpm in DEFAULT_PRESETS.iter() {
            writeln!(file, "RPM: {}", rpm).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn read_presets() -> Result<Vec<u32>, String> {
    let file = File::open(PRESETS_PATH).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);
    let mut presets = Vec::new();

    for line in reader.lines() {
        let line = line.map_err(|e| e.to_string())?;
        if let Some(rpm) = line.strip_prefix("RPM: ") {
            if let Ok(value) = rpm.parse::<u32>() {
                presets.push(value);
            }
        }
    }
    Ok(presets)
}

#[tauri::command]
pub fn add_preset(rpm: u32) -> Result<(), String> {
    // Create the file if it doesn't exist
    if !Path::new(PRESETS_PATH).exists() {
        initialize_presets()?;
    }

    let mut file = OpenOptions::new()
        .append(true)
        .create(true)  // This will create the file if it doesn't exist
        .open(PRESETS_PATH)
        .map_err(|e| e.to_string())?;
    
    writeln!(file, "RPM: {}", rpm).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_preset(old_rpm: u32, new_rpm: u32) -> Result<(), String> {
    let presets = read_presets()?;
    let mut file = File::create(PRESETS_PATH).map_err(|e| e.to_string())?;
    
    for rpm in presets {
        if rpm == old_rpm {
            writeln!(file, "RPM: {}", new_rpm).map_err(|e| e.to_string())?;
        } else {
            writeln!(file, "RPM: {}", rpm).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn delete_preset(rpm: u32) -> Result<(), String> {
    let presets = read_presets()?;
    let mut file = File::create(PRESETS_PATH).map_err(|e| e.to_string())?;
    
    for preset_rpm in presets {
        if preset_rpm != rpm {
            writeln!(file, "RPM: {}", preset_rpm).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
