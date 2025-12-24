type Metric =
  | { type: "timing"; values: number[] }
  | { type: "counter"; value: number };

export class MetricsCollector {
  private metrics = new Map<string, Metric>();

  recordTiming(operation: string, durationMs: number): void {
    const metric = this.metrics.get(operation);
    if (metric && metric.type === "timing") {
      metric.values.push(durationMs);
      return;
    }
    this.metrics.set(operation, { type: "timing", values: [durationMs] });
  }

  recordCounter(operation: string, increment = 1): void {
    const metric = this.metrics.get(operation);
    if (metric && metric.type === "counter") {
      metric.value += increment;
      return;
    }
    this.metrics.set(operation, { type: "counter", value: increment });
  }

  getSnapshot(): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    for (const [name, metric] of this.metrics.entries()) {
      if (metric.type === "counter") {
        snapshot[name] = { type: "counter", value: metric.value };
      } else {
        const total = metric.values.reduce((sum, value) => sum + value, 0);
        const avg = metric.values.length ? total / metric.values.length : 0;
        snapshot[name] = {
          type: "timing",
          count: metric.values.length,
          averageMs: avg,
          values: [...metric.values],
        };
      }
    }
    return snapshot;
  }
}
