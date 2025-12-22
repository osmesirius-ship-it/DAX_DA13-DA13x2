// MVTS Closed-Loop Demonstration
// Shows persistent learning across multiple cognitive loops

const MVTSCore = require('./mvts-core');

class ClosedLoopDemo {
  constructor() {
    this.mvts = new MVTSCore({
      storagePath: './demo-state.json',
      autoApplyRules: true,
      ruleApplicationInterval: 5000 // 5 seconds for demo
    });
  }

  async runDemonstration() {
    console.log('=== MVTS Closed-Loop Learning Demonstration ===\n');

    // Demo 1: Initial learning attempt
    console.log('1. First attempt: Implement user authentication system');
    const result1 = await this.mvts.processGoal({
      description: 'Implement secure user authentication system',
      priority: 'high',
      type: 'implementation'
    });

    console.log('Result:', this.formatResult(result1));
    console.log('System state after first attempt:', this.getSystemSummary());

    // Demo 2: Second attempt with learning from first failure
    console.log('\n2. Second attempt: Same goal (should learn from first attempt)');
    const result2 = await this.mvts.processGoal({
      description: 'Implement secure user authentication system',
      priority: 'high',
      type: 'implementation'
    });

    console.log('Result:', this.formatResult(result2));
    console.log('System state after second attempt:', this.getSystemSummary());

    // Demo 3: Different but related goal
    console.log('\n3. Third attempt: Related goal (should transfer learning)');
    const result3 = await this.mvts.processGoal({
      description: 'Implement secure user authorization system',
      priority: 'medium',
      type: 'implementation'
    });

    console.log('Result:', this.formatResult(result3));
    console.log('System state after third attempt:', this.getSystemSummary());

    // Demo 4: Analysis goal (different type)
    console.log('\n4. Fourth attempt: Analysis goal (different strategy)');
    const result4 = await this.mvts.processGoal({
      description: 'Analyze security vulnerabilities in existing system',
      priority: 'high',
      type: 'analysis'
    });

    console.log('Result:', this.formatResult(result4));
    console.log('System state after fourth attempt:', this.getSystemSummary());

    // Show learning progression
    console.log('\n=== Learning Progression Analysis ===');
    this.showLearningProgression([result1, result2, result3, result4]);

    // Show final system state
    console.log('\n=== Final System State ===');
    const finalState = this.mvts.getStateSnapshot();
    console.log('Beliefs:', Object.keys(finalState.state.beliefs).length);
    console.log('Strategies:', finalState.state.strategies.length);
    console.log('Failure patterns:', finalState.state.failure_patterns.length);
    console.log('Goals:', Object.keys(finalState.state.goals).length);

    this.mvts.shutdown();
  }

  formatResult(result) {
    const phases = result.phases || [];
    const planning = phases.find(p => p.name === 'planning');
    const execution = phases.find(p => p.name === 'execution');
    const evaluation = phases.find(p => p.name === 'evaluation');
    const learning = phases.find(p => p.name === 'learning');

    return {
      success: result.success,
      planning: planning ? {
        planCreated: !!planning.plan,
        steps: planning.plan?.steps.length || 0,
        strategy: planning.plan?.strategy || 'none'
      } : null,
      execution: execution ? {
        stepsExecuted: execution.steps_executed?.length || 0,
        successRate: execution.steps_executed?.filter(s => s.success).length / (execution.steps_executed?.length || 1) || 0
      } : null,
      evaluation: evaluation ? {
        outcome: evaluation.evaluation?.outcome || 'unknown',
        successScore: evaluation.evaluation?.success_score || 0
      } : null,
      learning: learning ? {
        insightsCount: learning.insights?.length || 0,
        insights: learning.insights?.map(i => i.insight) || []
      } : null
    };
  }

  getSystemSummary() {
    const status = this.mvts.getSystemStatus();
    return {
      avgBeliefConfidence: status.state_health.beliefs.avg_confidence,
      activeGoals: status.state_health.goals.active,
      avgStrategySuccess: status.state_health.strategies.avg_success,
      failurePatterns: status.state_health.failures.patterns
    };
  }

  showLearningProgression(results) {
    console.log('Strategy Evolution:');
    const strategies = results.map((r, i) => ({
      attempt: i + 1,
      strategy: r.planning?.strategy || 'none',
      success: r.success,
      successScore: r.evaluation?.successScore || 0
    }));
    
    strategies.forEach(s => {
      console.log(`  Attempt ${s.attempt}: ${s.strategy} (success: ${s.success}, score: ${s.successScore.toFixed(2)})`);
    });

    console.log('\nLearning Insights:');
    results.forEach((r, i) => {
      if (r.learning && r.learning.insights.length > 0) {
        console.log(`  Attempt ${i + 1}:`);
        r.learning.insights.forEach(insight => {
          console.log(`    - ${insight.insight}`);
        });
      }
    });

    console.log('\nConfidence Progression:');
    const state = this.mvts.getStateSnapshot();
    const beliefs = state.state.beliefs;
    
    Object.entries(beliefs)
      .filter(([_, belief]) => belief.evidence.some(e => e.type === 'successful_execution'))
      .forEach(([id, belief]) => {
        console.log(`  ${belief.claim}: ${belief.confidence.toFixed(2)}`);
      });
  }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  const demo = new ClosedLoopDemo();
  demo.runDemonstration().catch(console.error);
}

module.exports = ClosedLoopDemo;
