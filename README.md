# 🎮 Haptic Composer

A professional vibration sequencer that transforms musical patterns into tactile experiences through game controllers.

## ✨ Features

- **Real-time haptic sequencing** with 8 instruments × 16 steps
- **Dual-motor vibration control** for rich tactile feedback
- **Professional dark theme** interface
- **Pattern presets** and custom pattern creation
- **Save/Load** patterns in JSON format
- **Gamepad auto-detection** (Xbox, PlayStation, generic controllers)
- **Adjustable tempo** (60-200 BPM)
- **Keyboard shortcuts** support

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Game controller with vibration support
- Local HTTP server (to avoid CORS restrictions)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/haptic-composer.git
cd haptic-composer

# Start local server (choose one)
python -m http.server 8080
# or
npx http-server . -p 8080
# or use VS Code Live Server extension
```

Open `http://localhost:8080` in your browser.

## 🎯 Usage

1. **Connect your controller** (USB or Bluetooth)
2. **Press any button** to activate detection
3. **Click on the grid** to create patterns
4. **Use presets** for quick start (Kick, House, etc.)
5. **Press Play** to feel your creation through vibrations!

## 🎮 Supported Controllers

- ✅ Xbox One/Series (cable + Bluetooth)
- ✅ PlayStation 4/5 (cable + Bluetooth)  
- ✅ Nintendo Switch Pro Controller
- ✅ Generic controllers with vibration

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `Esc` | Stop |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Delete` | Clear pattern |

## 🏗️ Project Structure

```
src/
├── js/
│   ├── main.js              # App entry point
│   ├── GamepadManager.js    # Controller handling
│   ├── VibrationEngine.js   # Haptic generation
│   ├── Sequencer.js         # Timing & playback
│   ├── PatternManager.js    # Pattern management
│   └── UIController.js      # User interface
├── css/
│   ├── main.css            # Core styles
│   ├── sequencer.css       # Grid styles
│   └── controls.css        # UI controls
└── data/
    └── instruments.json    # Instrument configs
```

## 🔧 Development

### Architecture
- **Modular design** with clear separation of concerns
- **Event-driven** communication between components
- **Responsive** professional UI with glassmorphism design
- **ES6+ JavaScript** with modern web APIs

### Adding Custom Instruments

1. Edit `src/data/instruments.json`:
```json
{
  "MyInstrument": {
    "weak": 0.6,
    "strong": 0.8,
    "duration": 200,
    "description": "My custom instrument"
  }
}
```

2. Add to `PatternManager.instruments` array

### Creating Presets

```javascript
// In PatternManager.js
this.presets['my_preset'] = {
  name: 'My Pattern',
  description: 'Custom pattern description',
  pattern: {
    'Kick': [true, false, true, false, ...],
    // ... other instruments
  }
};
```

## 🐛 Troubleshooting

**Controller not detected?**
- Check connection and press any button
- Try different USB port or re-pair Bluetooth
- Restart browser

**No vibrations?**
- Test with "Test Vibration" buttons
- Check controller supports haptic feedback
- Increase intensity sliders

**Performance issues?**
- Use Chrome for best performance
- Reduce active pattern complexity
- Close other browser tabs

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎵 Credits

Built with modern web technologies:
- **Gamepad API** for controller access
- **Vibration API** for haptic feedback
- **CSS Grid** for responsive layout
- **ES6 Modules** for clean architecture

---

**Made with ❤️ for the haptic music community**
