import express from "express";
import si from "systeminformation";
import { exec } from "child_process";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
dotenv.config();
const app = express();
const PORT = 5000;
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, 
  message: { error: "Too many requests, please try again later." }
});
function getSensors(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec("sensors", (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
function parseSensors(output: string) {
  const lines = output.split("\n");

  let cpuPackage = null;
  let cores: number[] = [];
  let gpu = null;

  for (const line of lines) {
    // CPU package
    if (line.includes("Package id 0")) {
      cpuPackage = parseFloat(line.match(/\+([0-9.]+)/)?.[1] || "0");
    }

    // CPU cores
    if (line.includes("Core")) {
      const val = parseFloat(line.match(/\+([0-9.]+)/)?.[1] || "0");
      cores.push(val);
    }

    // GPU (approx: TCGC)
    if (line.includes("TCGC")) {
      gpu = parseFloat(line.match(/\+([0-9.]+)/)?.[1] || "0");
    }

   
  }

  return {
    cpu_package: cpuPackage,
    cpu_cores: cores,
    gpu,

  };
}
app.get("/stats", async (req, res) => {
  const key = req.headers["x-api-key"];

  const apiKey = process.env.API_KEY;

  if (!key || Array.isArray(key) || key.trim() !== apiKey) {
    return res.status(403).json({ error: "Unauthorized" });
  }
try {  const cpu = await si.currentLoad();
    const mem = await si.mem();
    const temp = await si.cpuTemperature();
    const disks = await si.fsSize();
    const network = await si.networkStats();
    const sensorsRaw = await getSensors();
    const temps = parseSensors(sensorsRaw);
 const formatBytesToMB = (bytes: number) => Math.round(bytes / 1024 / 1024);
const formatBytesToGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);

res.json({
  cpu: {
    usage_percent: Number(cpu.currentLoad.toFixed(2)),
    temperature_c: temps.cpu_package || temp.main
  },

  memory: {
    usage_percent: Number(((mem.used / mem.total) * 100).toFixed(2)),
    total_mb: formatBytesToMB(mem.total),
    used_mb: formatBytesToMB(mem.used)
  },

  disks: disks.map(d => ({
    mount: d.mount,
    used_gb: formatBytesToGB(d.used),
    total_gb: formatBytesToGB(d.size),
    usage_percent: Number(((d.used / d.size) * 100).toFixed(1))
  })),

  network: {
    interface: network[0]?.iface,
    rx_kb_s: Math.round((network[0]?.rx_sec || 0) / 1024),
    tx_kb_s: Math.round((network[0]?.tx_sec || 0) / 1024)
  },

  temperatures: temps
});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(limiter);