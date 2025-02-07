use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Preset {
    name: String,
    rpm: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PresetInput {
    name: String,
    rpm: u32,
}

const DEFAULT_PRESETS: [(u32, &str); 8] = [
    (25, "Very Slow"),
    (50, "Slow"),
    (75, "Medium Slow"),
    (100, "Medium"),
    (125, "Medium Fast"),
    (150, "Fast"),
    (175, "Very Fast"),
    (200, "Maximum"),
];

const PRESETS_PATH: &str = "../presets.txt";

#[tauri::command]
pub fn initialize_presets() -> Result<(), String> {
    if !Path::new(PRESETS_PATH).exists() {
        let mut file = File::create(PRESETS_PATH).map_err(|e| e.to_string())?;
        for (rpm, name) in DEFAULT_PRESETS.iter() {
            writeln!(file, "NAME: {}\tRPM: {}", name, rpm).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn read_presets() -> Result<Vec<Preset>, String> {
    let file = File::open(PRESETS_PATH).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);
    let mut presets = Vec::new();

    for line in reader.lines() {
        let line = line.map_err(|e| e.to_string())?;
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() == 2 {
            if let (Some(name), Some(rpm_str)) = (
                parts[0].strip_prefix("NAME: "),
                parts[1].strip_prefix("RPM: ")
            ) {
                if let Ok(rpm) = rpm_str.parse::<u32>() {
                    presets.push(Preset {
                        name: name.to_string(),
                        rpm,
                    });
                }
            }
        }
    }
    Ok(presets)
}

#[tauri::command]
pub async fn add_preset(input: PresetInput) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(PRESETS_PATH)
        .map_err(|e| e.to_string())?;
    
    writeln!(file, "NAME: {}\tRPM: {}", input.name, input.rpm).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_preset(rpm: u32) -> Result<(), String> {
    let presets = read_presets()?;
    let mut file = File::create(PRESETS_PATH).map_err(|e| e.to_string())?;
    
    for preset in presets {
        if preset.rpm != rpm {
            writeln!(file, "NAME: {}\tRPM: {}", preset.name, preset.rpm)
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
