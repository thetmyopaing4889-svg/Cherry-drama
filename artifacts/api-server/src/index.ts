import { spawn } from "child_process";
import path from "path";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const PIPELINE_DIR = process.env["PIPELINE_DIR"] ?? path.join(__dirname, "../../../cherry-drama-repo/pipeline");

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  const workerScript = path.join(PIPELINE_DIR, "worker.py");
  const worker = spawn("python3", [workerScript], {
    env: {
      ...process.env,
      PIPELINE_DIR,
      API_BASE_URL: `http://localhost:${port}/api`,
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  worker.stdout?.on("data", (data: Buffer) => {
    logger.info({ src: "python-worker" }, data.toString().trimEnd());
  });

  worker.stderr?.on("data", (data: Buffer) => {
    logger.error({ src: "python-worker" }, data.toString().trimEnd());
  });

  worker.on("error", (err) => {
    logger.warn({ err }, "Python worker could not be started — pipeline will not run automatically. Start pipeline/worker.py manually.");
  });

  worker.on("exit", (code, signal) => {
    if (code !== 0) {
      logger.warn({ code, signal }, "Python worker exited unexpectedly");
    }
  });
});
