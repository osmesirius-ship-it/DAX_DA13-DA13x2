import { StageManager } from "./StageManager";
import {
  GovernanceEngineOptions,
  GovernanceRunResult,
  GovernanceStage,
  StageContext,
  StageResult,
} from "./types";

const nowIso = () => new Date().toISOString();

export class GovernanceEngine {
  private stageManager: StageManager;
  private metricsCollector?: GovernanceEngineOptions["metricsCollector"];
  private history: GovernanceRunResult[] = [];
  private storeHistory: boolean;

  constructor(options: GovernanceEngineOptions) {
    this.stageManager = new StageManager(options.stages);
    this.metricsCollector = options.metricsCollector;
    this.storeHistory = options.storeHistory ?? true;
  }

  getHistory(): GovernanceRunResult[] {
    return [...this.history];
  }

  registerStage(stage: GovernanceStage): void {
    this.stageManager.addStage(stage);
  }

  async run(
    input: unknown,
    metadata?: Record<string, unknown>
  ): Promise<GovernanceRunResult> {
    const runId = crypto.randomUUID();
    const startedAt = nowIso();
    const results: Record<string, StageResult> = {};
    const executionPlan = this.stageManager.getExecutionPlan();
    const stageResults: StageResult[] = [];

    for (const stage of executionPlan) {
      const dependencyStatuses = (stage.dependencies ?? []).map(
        (dependencyId) => results[dependencyId]?.status
      );

      if (dependencyStatuses.some((status) => status !== "success")) {
        const startedSkip = nowIso();
        const finishedSkip = nowIso();
        const skippedResult: StageResult = {
          stageId: stage.id,
          status: "skipped",
          startedAt: startedSkip,
          finishedAt: finishedSkip,
          durationMs: 0,
          skippedReason: "Dependency failed or skipped",
        };
        results[stage.id] = skippedResult;
        stageResults.push(skippedResult);
        this.metricsCollector?.recordCounter("stages.skipped");
        continue;
      }

      const stageStarted = nowIso();
      const startedMs = performance.now();
      try {
        const context: StageContext = { input, results, metadata };
        const output = await stage.run(context);
        const durationMs = performance.now() - startedMs;
        const stageFinished = nowIso();

        const stageResult: StageResult = {
          stageId: stage.id,
          status: "success",
          output,
          startedAt: stageStarted,
          finishedAt: stageFinished,
          durationMs,
        };
        results[stage.id] = stageResult;
        stageResults.push(stageResult);
        this.metricsCollector?.recordCounter("stages.success");
        this.metricsCollector?.recordTiming(
          `stage.${stage.id}.duration`,
          durationMs
        );
      } catch (error) {
        const durationMs = performance.now() - startedMs;
        const stageFinished = nowIso();
        const stageResult: StageResult = {
          stageId: stage.id,
          status: "failed",
          startedAt: stageStarted,
          finishedAt: stageFinished,
          durationMs,
          errors: [error instanceof Error ? error.message : String(error)],
        };
        results[stage.id] = stageResult;
        stageResults.push(stageResult);
        this.metricsCollector?.recordCounter("stages.failed");
        this.metricsCollector?.recordTiming(
          `stage.${stage.id}.duration`,
          durationMs
        );
      }
    }

    const finishedAt = nowIso();
    const durationMs =
      new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    const success = stageResults.every(
      (result) => result.status === "success"
    );

    const runResult: GovernanceRunResult = {
      runId,
      startedAt,
      finishedAt,
      durationMs,
      stages: stageResults,
      success,
    };

    if (this.storeHistory) {
      this.history.push(runResult);
    }

    return runResult;
  }
}
