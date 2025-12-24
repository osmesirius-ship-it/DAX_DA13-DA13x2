import http, { IncomingMessage, ServerResponse } from "http";
import { MetricsCollectorLike } from "../types";

interface DashboardServerOptions {
  metricsCollector: MetricsCollectorLike;
  getRuns: () => unknown;
}

export class DashboardServer {
  private server?: http.Server;
  private metricsCollector: MetricsCollectorLike;
  private getRuns: () => unknown;

  constructor(options: DashboardServerOptions) {
    this.metricsCollector = options.metricsCollector;
    this.getRuns = options.getRuns;
  }

  start(port = 0): Promise<number> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) =>
        this.handleRequest(req, res)
      );
      this.server.listen(port, () => {
        const address = this.server?.address();
        const resolvedPort =
          typeof address === "object" && address ? address.port : port;
        resolve(resolvedPort);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private handleRequest(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>
  ): void {
    if (!req.url) {
      res.writeHead(400);
      res.end();
      return;
    }

    if (req.url === "/health") {
      this.respondJson(res, { status: "ok" });
      return;
    }

    if (req.url === "/metrics") {
      this.respondJson(res, this.metricsCollector.getSnapshot());
      return;
    }

    if (req.url === "/runs") {
      this.respondJson(res, this.getRuns());
      return;
    }

    this.respondJson(res, { error: "Not found" }, 404);
  }

  private respondJson(
    res: ServerResponse<IncomingMessage>,
    payload: unknown,
    statusCode = 200
  ): void {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  }
}
