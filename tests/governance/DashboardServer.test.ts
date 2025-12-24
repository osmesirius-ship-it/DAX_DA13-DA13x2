import { afterEach, describe, expect, it } from "vitest";
import { DashboardServer } from "../../src/dashboard/DashboardServer";
import { MetricsCollector } from "../../src/MetricsCollector";

describe("DashboardServer", () => {
  let server: DashboardServer | undefined;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
    server = undefined;
  });

  it("serves health and metrics endpoints", async () => {
    const metrics = new MetricsCollector();
    metrics.recordCounter("runs", 1);

    server = new DashboardServer({
      metricsCollector: metrics,
      getRuns: () => [],
    });

    const port = await server.start(0);
    const baseUrl = `http://localhost:${port}`;

    const health = await fetch(`${baseUrl}/health`).then((res) => res.json());
    const metricsResponse = await fetch(`${baseUrl}/metrics`).then((res) =>
      res.json()
    );

    expect(health).toEqual({ status: "ok" });
    expect(metricsResponse).toMatchObject({
      runs: { type: "counter", value: 1 },
    });
  });
});
