import { DashboardServer, GovernanceEngine, MetricsCollector } from "../src";

const metrics = new MetricsCollector();
const engine = new GovernanceEngine({
  stages: [
    {
      id: "stage-one",
      run: ({ input }) => ({ ok: true, input }),
    },
  ],
  metricsCollector: metrics,
});

async function main() {
  await engine.run({ sample: "payload" });

  const dashboard = new DashboardServer({
    metricsCollector: metrics,
    getRuns: () => engine.getHistory(),
  });

  const port = await dashboard.start(0);
  console.log(`Dashboard running on http://localhost:${port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
