import { describe, expect, it } from "vitest";
import { GovernanceEngine } from "../../src/GovernanceEngine";
import { MetricsCollector } from "../../src/MetricsCollector";

describe("GovernanceEngine", () => {
  it("runs stages and records results", async () => {
    const metrics = new MetricsCollector();
    const engine = new GovernanceEngine({
      stages: [
        { id: "one", run: () => ({ ok: true }) },
        {
          id: "two",
          dependencies: ["one"],
          run: ({ results }) => ({
            previous: results.one.output,
          }),
        },
      ],
      metricsCollector: metrics,
    });

    const result = await engine.run({ payload: true });
    expect(result.success).toBe(true);
    expect(result.stages).toHaveLength(2);
    expect(metrics.getSnapshot()).toMatchObject({
      "stage.one.duration": { type: "timing" },
      "stage.two.duration": { type: "timing" },
      "stages.success": { type: "counter", value: 2 },
    });
  });

  it("skips stages when dependencies fail", async () => {
    const engine = new GovernanceEngine({
      stages: [
        {
          id: "fail",
          run: () => {
            throw new Error("boom");
          },
        },
        { id: "skip", dependencies: ["fail"], run: () => null },
      ],
    });

    const result = await engine.run("input");
    expect(result.success).toBe(false);
    expect(result.stages[1].status).toBe("skipped");
  });
});
