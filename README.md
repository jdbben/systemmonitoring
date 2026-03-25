🖥️ System Monitoring API (HomeRack)

A lightweight and easy-to-install server monitoring API built with Node.js and TypeScript.
This project exposes system statistics (CPU, memory, disk, network, and temperatures) through a simple HTTP API that you can use in your dashboards, scripts, or remote monitoring tools.

🚀 Features
📊 CPU usage & temperature
🧠 Memory usage
💾 Disk usage
🌐 Network statistics
🌡️ Sensor-based temperatures (via lm-sensors)
⚡ Lightweight and fast
🔌 Simple REST API (/stats)
🧠 Why this project?

This project is designed for home servers / homelabs where you need:

A simple API instead of heavy monitoring stacks
Low resource usage
Easy integration with custom dashboards or apps
⚡ Why NOT Docker?

Initially, this project was tested with Docker, but we faced a key limitation:

❌ Docker isolates containers from the host system hardware.

This caused issues such as:

Inability to read CPU temperatures
sensors command failing or returning incomplete data
Limited access to /sys and /proc
Missing hardware monitoring (ACPI / hwmon)

Even with privileged mode and mounted volumes, some hardware data remains inaccessible depending on the system.

👉 Solution: Run the API directly on the host using Node.js.

This ensures:

Full access to system information
Accurate temperature and sensor readings
More reliable monitoring
🛠️ Installation (Recommended: Node.js)
1. Install Node.js (v18+ or v20 recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
2. Install pnpm (optional but recommended)
npm install -g pnpm
3. Clone the repository
git clone https://github.com/your-username/systemmonitoring.git
cd systemmonitoring
4. Install dependencies
pnpm install
5. Install sensors (for temperature data)
sudo apt install lm-sensors
sudo sensors-detect
▶️ Run the server
pnpm exec ts-node index.ts

You should see:

Server running on port 5000
🌐 API Usage
Get system stats
curl http://localhost:5000/stats

Example response:

{
  "cpu": {
    "usage_percent": 23.5,
    "temperature_c": 65
  },
  "memory": {
    "usage_percent": 54.2,
    "total_mb": 8192,
    "used_mb": 4440
  }
}
🔒 Security (optional)

You can secure the API using an API key via environment variables:

API_KEY=your_secret_key

Then validate requests using headers (x-api-key).

🔁 Run on startup (systemd)

To make the API start automatically on boot, create a systemd service:

sudo nano /etc/systemd/system/sysmonitor.service

Example:

[Unit]
Description=System Monitoring API
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/home/yourusername/systemmonitoring
ExecStart=/usr/bin/pnpm exec ts-node index.ts
Restart=always

[Install]
WantedBy=multi-user.target

Enable it:

sudo systemctl daemon-reload
sudo systemctl enable sysmonitor
sudo systemctl start sysmonitor
🧩 Future Improvements
Web dashboard UI
WebSocket real-time updates
Alerts (CPU temp, RAM usage)
Authentication & HTTPS support
🤝 Contributing

Feel free to fork and improve the project. Suggestions and improvements are welcome!

📌 Summary
✅ Lightweight
✅ Easy to install
✅ Works directly on your server
❗ Avoid Docker for full hardware access

Built for homelab enthusiasts who want simple, fast, and reliable monitoring 🚀
