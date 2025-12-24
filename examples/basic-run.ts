import { GovernanceEngine, MetricsCollector } from "../src";

const metrics = new MetricsCollector();

const engine = new GovernanceEngine({
  stages: [
    {
      id: "ingest",
      run: ({ input }) => ({ normalized: String(input).trim() }),
    },
    {
      id: "validate",
      dependencies: ["ingest"],
      run: ({ results }) => {
        const payload = results.ingest.output as { normalized: string };
        if (!payload.normalized) {
          throw new Error("Input was empty");
        }
        return { valid: true };
      },
    },
  ],
  metricsCollector: metrics,
});

async function main() {
  const run = await engine.run("  PKD integrity run  ");
  console.log("Run result:", run);
  console.log("Metrics:", metrics.getSnapshot());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
