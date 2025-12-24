import { GovernanceStage } from "./types";

export class StageManager {
  private stages = new Map<string, GovernanceStage>();

  constructor(initialStages: GovernanceStage[] = []) {
    initialStages.forEach((stage) => this.addStage(stage));
  }

  addStage(stage: GovernanceStage): void {
    if (this.stages.has(stage.id)) {
      throw new Error(`Stage already registered: ${stage.id}`);
    }
    this.stages.set(stage.id, stage);
  }

  getStage(id: string): GovernanceStage | undefined {
    return this.stages.get(id);
  }

  getExecutionPlan(): GovernanceStage[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, Set<string>>();

    for (const [id, stage] of this.stages.entries()) {
      inDegree.set(id, 0);
      graph.set(id, new Set());

      for (const dependency of stage.dependencies ?? []) {
        if (!this.stages.has(dependency)) {
          throw new Error(
            `Stage ${id} depends on missing stage ${dependency}`
          );
        }
        graph.get(dependency)?.add(id);
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(id);
    }

    const ordered: GovernanceStage[] = [];
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) break;
      const stage = this.stages.get(id);
      if (stage) ordered.push(stage);

      for (const dependent of graph.get(id) ?? []) {
        const nextDegree = (inDegree.get(dependent) ?? 0) - 1;
        inDegree.set(dependent, nextDegree);
        if (nextDegree === 0) queue.push(dependent);
      }
    }

    if (ordered.length !== this.stages.size) {
      throw new Error("Stage dependency cycle detected");
    }

    return ordered;
  }
}
