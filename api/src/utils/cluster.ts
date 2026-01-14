import cluster, { Worker } from "node:cluster";
import os from "node:os";

export interface ClusterOptions {
    workers?: number;
    restartOnExit?: boolean;
    onWorkerStart?: (worker: Worker) => void;
  }
  
  export function runCluster(startWorker: () => void, options: ClusterOptions = {
    workers: 0, // 0 = use all CPU cores
    restartOnExit: true, // restart workers if they crash
    onWorkerStart: (worker: Worker) => { // log when a worker starts
      console.log(`Worker ${worker.process.pid} started`);
    },
  }) {
    const numCPUs = os.cpus().length || options.workers;
    if (!numCPUs) {
      console.warn("No CPU cores detected. Not running in cluster mode.");
      startWorker();
      return;
    }
    console.log("Number of CPU cores detected: ", numCPUs);
    if (cluster.isPrimary) {
      console.log(`Master ${process.pid} is running with ${numCPUs} workers`);
  
      for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        options.onWorkerStart?.(worker);
      }
  
      cluster.on("exit", (worker: Worker, code: number, signal: string) => {
        console.warn(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
        if (options.restartOnExit !== false) {
          console.log("Restarting worker...");
          cluster.fork();
        }
      });
  
    } else {
      startWorker();
      console.log(`Worker ${process.pid} started`);
    }
  }
  
