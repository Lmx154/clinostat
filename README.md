# 🔄 Clinostat Controller

A modern desktop application for controlling and monitoring motor RPM in clinostat systems. Built with Tauri 2.0, combining the performance of Rust with a React frontend.

## ✨ Features

### 🎛️ Motor Control
- 📊 Real-time RPM monitoring via serial connection
- 🎮 Direct RPM input control
- 🚦 Live status monitoring (Online/Offline)
- 📈 Actual vs Input RPM display
- 🔄 Multiple motor support with individual control boxes

### 💾 Preset Management
- 📁 Create and save motor presets
- 🗃️ Store preset configurations (Title & RPM)
- ⚡ Quick preset application
- ✏️ Custom preset naming

### 🔌 System Integration
- 🔍 Automatic serial port detection
- 📡 Real-time data streaming at 4Hz
- ⚙️ System-wide settings management
- 🛡️ Error handling and status reporting

## 🛠️ Tech Stack

### 🎨 Frontend
- ⚛️ React
- ⚡ Vite
- 🎯 TailwindCSS
- 📜 JavaScript
- 🔗 Tauri API

### 🏗️ Backend
- 🦀 Rust
- 🚀 Tauri 2.0
- 📊 Serial Port Communication
- 🔄 Event-driven architecture

## 🚀 Installation

1. Clone the repository:
```bash
git clone git@github.com:Lmx154/clinostat.git
cd clinostat
```

2. Install dependencies:
```bash
npm install
```

3. Run the development environment:
```bash
npm run tauri dev
```

## 👨‍💻 Development

The application uses a component-based architecture:
- 📦 `MotorBox`: Individual motor control and monitoring
- ⚙️ `Settings`: Preset management for each motor
- 🔧 `SystemSettings`: Global application configuration

## 🔌 Serial Communication

The application communicates with the clinostat controller via serial port:
- Automatic device detection
- 4Hz data sampling rate
- Bidirectional communication for RPM control
- Real-time status monitoring

## 🤝 Contributing

Contributions are welcome from members of the UTRGV S.A.R.E. software team!

### Current Contributors
- Luis Martinez ([GitHub](https://github.com/Lmx154))
- Baldemar Guajardo ([GitHub](https://github.com/godxrs))

Please feel free to submit a Pull Request.

