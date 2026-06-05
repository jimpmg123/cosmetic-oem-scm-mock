/**
 * Free ports 3000–3003 (stale Next dev) before starting a fresh server.
 */
import { execSync } from "child_process";

const ports = [3000, 3001, 3002, 3003];

for (const port of ports) {
  try {
    if (process.platform === "win32") {
      const out = execSync(
        `netstat -ano | findstr ":${port}" | findstr LISTENING`,
        { encoding: "utf8" },
      );
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        const m = line.trim().match(/\s+(\d+)\s*$/);
        if (m) pids.add(m[1]);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid} /T`, { stdio: "ignore" });
          console.log(`killed port ${port} pid ${pid}`);
        } catch {
          /* already gone */
        }
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`, {
        shell: true,
        stdio: "ignore",
      });
    }
  } catch {
    /* nothing listening */
  }
}
