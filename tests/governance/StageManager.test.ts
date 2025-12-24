import { describe, expect, it } from "vitest";
import { StageManager } from "../../src/StageManager";

describe("StageManager", () => {
  it("orders stages based on dependencies", () => {
    const manager = new StageManager([
      { id: "c", dependencies: ["b"], run: () => null },
      { id: "a", run: () => null },
      { id: "b", dependencies: ["a"], run: () => null },
    ]);

    const plan = manager.getExecutionPlan().map((stage) => stage.id);
    expect(plan).toEqual(["a", "b", "c"]);
  });

  it("throws on missing dependencies", () => {
    const manager = new StageManager([
      { id: "a", dependencies: ["missing"], run: () => null },
    ]);

    expect(() => manager.getExecutionPlan()).toThrow(
      "depends on missing stage"
    );
  });

  it("throws on cycles", () => {
    const manager = new StageManager([
      { id: "a", dependencies: ["b"], run: () => null },
      { id: "b", dependencies: ["a"], run: () => null },
    ]);

    expect(() => manager.getExecutionPlan()).toThrow(
      "Stage dependency cycle"
    );
  });
});
