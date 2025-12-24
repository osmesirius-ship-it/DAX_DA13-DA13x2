export type StageStatus = "success" | "failed" | "skipped";

export interface StageResult {
  stageId: string;
  status: StageStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  output?: unknown;
  errors?: string[];
  skippedReason?: string;
}

export interface StageContext {
  input: unknown;
  results: Record<string, StageResult>;
  metadata?: Record<string, unknown>;
}

export interface GovernanceStage {
  id: string;
  description?: string;
  dependencies?: string[];
  run(context: StageContext): Promise<unknown> | unknown;
}

export interface GovernanceRunResult {
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  stages: StageResult[];
  success: boolean;
}

export interface GovernanceEngineOptions {
  stages: GovernanceStage[];
  metricsCollector?: MetricsCollectorLike;
  storeHistory?: boolean;
}

export interface MetricsCollectorLike {
  recordTiming(operation: string, durationMs: number): void;
  recordCounter(operation: string, increment?: number): void;
  getSnapshot(): Record<string, unknown>;
}
