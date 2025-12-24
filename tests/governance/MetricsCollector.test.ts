import { describe, expect, it } from "vitest";
import { MetricsCollector } from "../../src/MetricsCollector";

describe("MetricsCollector", () => {
  it("records counters and timings", () => {
    const collector = new MetricsCollector();
    collector.recordCounter("runs");
    collector.recordCounter("runs", 2);
    collector.recordTiming("stage.a", 10);
    collector.recordTiming("stage.a", 20);

    const snapshot = collector.getSnapshot();
    expect(snapshot).toMatchObject({
      runs: { type: "counter", value: 3 },
      "stage.a": { type: "timing", count: 2 },
    });
  });
});
