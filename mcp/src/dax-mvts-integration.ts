// DA-13 + MVTS Integration
// Bridges governance wrapper with cognitive substrate

import { DAXGovernanceCore } from './dax-core';

interface MVTSConfig {
  storagePath?: string;
  modelClient?: any;
  autoApplyRules?: boolean;
}

interface CognitiveGovernanceInput {
  input: string;
  includeReasons?: boolean;
  layerOverrides?: Record<string, any>;
  enableCognition?: boolean;
  cognitiveContext?: Record<string, any>;
}

interface CognitiveGovernanceResult {
  output: string;
  trace: Array<{
    layer: string;
    output: string;
    reason?: string;
  }>;
  cognition?: {
    loopId: string;
    learning: any[];
    stateChanges: any[];
    success: boolean;
  };
}

// Import MVTSCore dynamically to avoid TypeScript module resolution issues
let MVTSCore: any;
try {
  MVTSCore = require('../../mvts/mvts-core').MVTSCore;
} catch (error) {
  console.warn('MVTS module not found, cognitive features will be disabled');
  MVTSCore = null;
}

export class DAXMVTSGovernance extends DAXGovernanceCore {
  private mvts: any;
  private cognitionEnabled: boolean;

  constructor(config: { apiKey: string; model?: string; mvtsConfig?: MVTSConfig }) {
    super(config);
    
    this.cognitionEnabled = !!MVTSCore;
    this.mvts = MVTSCore ? new MVTSCore(config.mvtsConfig || {}) : null;
  }

  async runCognitiveGovernance(input: CognitiveGovernanceInput): Promise<CognitiveGovernanceResult> {
    const { enableCognition = true, cognitiveContext = {}, ...governanceInput } = input;
    
    // Run standard DA-13 governance first
    const governanceResult = await this.runGovernance(governanceInput);
    
    // Apply cognitive enhancement if enabled
    if (enableCognition && this.cognitionEnabled) {
      const cognitiveResult = await this.applyCognitiveEnhancement(
        governanceResult.output,
        cognitiveContext
      );
      
      return {
        ...governanceResult,
        cognition: cognitiveResult
      };
    }
    
    return governanceResult;
  }

  private async applyCognitiveEnhancement(governanceOutput: string, context: Record<string, any>): Promise<any> {
    try {
      // Extract actionable goals from governance output
      const goals = this.extractGoalsFromOutput(governanceOutput);
      
      if (goals.length === 0) {
        return {
          loopId: 'no_goals',
          learning: [],
          stateChanges: [],
          success: true,
          message: 'No actionable goals identified for cognitive processing'
        };
      }

      // Process each goal through MVTS cognitive loop
      const cognitiveResults = [];
      for (const goal of goals) {
        const result = await this.mvts.processGoal(goal, context);
        cognitiveResults.push(result);
      }

      // Aggregate learning and state changes
      const allLearning = cognitiveResults.flatMap(r => r.learning);
      const stateChanges = this.identifyStateChanges(cognitiveResults);
      
      return {
        loopId: `cognitive_${Date.now()}`,
        learning: allLearning,
        stateChanges,
        success: cognitiveResults.every(r => r.success),
        processedGoals: goals.length,
        cognitiveResults
      };

    } catch (error) {
      return {
        loopId: `error_${Date.now()}`,
        learning: [],
        stateChanges: [],
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private extractGoalsFromOutput(output: string): any[] {
    const goals = [];
    
    // Look for action items, directives, or objectives
    const goalPatterns = [
      /implement|create|develop|build|establish/i,
      /improve|enhance|optimize|refine/i,
      /analyze|evaluate|assess|review/i,
      /design|plan|architect|structure/i
    ];

    const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      for (const pattern of goalPatterns) {
        if (pattern.test(sentence)) {
          goals.push({
            description: sentence.trim(),
            priority: this.determinePriority(sentence),
            type: this.determineGoalType(sentence, pattern)
          });
          break; // One goal per sentence
        }
      }
    }

    return goals;
  }

  private determinePriority(sentence: string): string {
    const highPriorityWords = ['critical', 'urgent', 'immediate', 'essential', 'must'];
    const lowPriorityWords = ['consider', 'optional', 'could', 'might', 'potential'];
    
    const lowerSentence = sentence.toLowerCase();
    
    if (highPriorityWords.some(word => lowerSentence.includes(word))) {
      return 'high';
    } else if (lowPriorityWords.some(word => lowerSentence.includes(word))) {
      return 'low';
    }
    
    return 'medium';
  }

  private determineGoalType(sentence: string, pattern: RegExp): string {
    if (/implement|create|develop|build/i.test(sentence)) {
      return 'implementation';
    } else if (/improve|enhance|optimize/i.test(sentence)) {
      return 'improvement';
    } else if (/analyze|evaluate|assess/i.test(sentence)) {
      return 'analysis';
    } else if (/design|plan|architect/i.test(sentence)) {
      return 'planning';
    }
    
    return 'general';
  }

  private identifyStateChanges(cognitiveResults: any[]): any[] {
    const changes = [];
    
    for (const result of cognitiveResults) {
      // Extract state changes from cognitive loop phases
      for (const phase of result.phases) {
        if (phase.name === 'state_update' && phase.actions_taken) {
          changes.push(...phase.actions_taken);
        }
      }
    }
    
    return changes;
  }

  // Enhanced policy validation with cognitive learning
  async validateAgainstPoliciesWithLearning(input: any): Promise<any> {
    // Standard policy validation
    const standardResult = await this.validateAgainstPolicies(input);
    
    // Apply cognitive learning to improve future validations
    if (this.cognitionEnabled && !standardResult.valid) {
      const learningGoal = {
        description: `Learn to avoid policy violations: ${standardResult.issues?.join(', ')}`,
        priority: 'high',
        type: 'learning'
      };
      
      try {
        await this.mvts.processGoal(learningGoal, {
          policy_violations: standardResult.issues,
          blocked_operations: standardResult.blockedOperations,
          original_request: input.request
        });
      } catch (error) {
        console.error('Failed to apply cognitive learning to policy validation:', error);
      }
    }
    
    return standardResult;
  }

  // Risk assessment with cognitive pattern learning
  async performRiskAssessmentWithLearning(input: any): Promise<any> {
    // Standard risk assessment
    const standardResult = await this.performRiskAssessment(input);
    
    // Learn from risk patterns
    if (this.cognitionEnabled && standardResult.requiresHumanEscalation) {
      const riskLearningGoal = {
        description: `Learn to mitigate high-risk scenarios: ${input.action}`,
        priority: 'high',
        type: 'risk_mitigation'
      };
      
      try {
        await this.mvts.processGoal(riskLearningGoal, {
          risk_level: standardResult.riskLevel,
          recommendation: standardResult.recommendation,
          reasoning: standardResult.reasoning,
          action: input.action
        });
      } catch (error) {
        console.error('Failed to apply cognitive learning to risk assessment:', error);
      }
    }
    
    return standardResult;
  }

  // Get cognitive system status
  async getCognitiveSystemStatus(): Promise<any> {
    return {
      governance: await this.getSystemStatus(),
      cognition: this.mvts.getSystemStatus(),
      integration: {
        cognitionEnabled: this.cognitionEnabled,
        lastCognitiveLoop: this.getLastCognitiveActivity(),
        totalCognitiveLoops: this.getTotalCognitiveLoops()
      }
    };
  }

  private getLastCognitiveActivity(): string {
    // Return timestamp of last cognitive activity
    const state = this.mvts.getStateSnapshot();
    return state.system_status.last_update;
  }

  private getTotalCognitiveLoops(): number {
    // Return total number of cognitive loops executed
    const state = this.mvts.getStateSnapshot();
    return state.system_status.completed_plans || 0;
  }

  // Enable/disable cognitive enhancement
  setCognitionEnabled(enabled: boolean): void {
    this.cognitionEnabled = enabled;
  }

  // Reset cognitive state
  resetCognitiveState(): void {
    this.mvts = new MVTSCore({
      storagePath: './mvts-state-reset.json',
      autoApplyRules: true
    });
  }

  // Export cognitive insights
  exportCognitiveInsights(): any {
    const state = this.mvts.getStateSnapshot();
    
    return {
      beliefs: state.state.beliefs,
      strategies: state.state.strategies,
      failure_patterns: state.state.failure_patterns,
      learning_summary: {
        total_beliefs: Object.keys(state.state.beliefs).length,
        avg_confidence: this.calculateAvgConfidence(state.state.beliefs),
        effective_strategies: state.state.strategies.filter((s: any) => s.success_rate > 0.7).length,
        common_failures: state.state.failure_patterns.slice(0, 5)
      }
    };
  }

  private calculateAvgConfidence(beliefs: Record<string, any>): number {
    const beliefValues = Object.values(beliefs);
    if (beliefValues.length === 0) return 0;
    
    const totalConfidence = beliefValues.reduce((sum: number, belief: any) => sum + belief.confidence, 0);
    return totalConfidence / beliefValues.length;
  }

  // Cleanup method
  shutdown(): void {
    this.mvts.shutdown();
  }
}
