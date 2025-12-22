// MVTS Core - Minimum Viable Thinking Server
// Integrates all 4 core modules into a cohesive cognitive substrate

const StateStore = require('./state-store');
const Planner = require('./planner');
const OutcomeEvaluator = require('./outcome-evaluator');
const UpdateRules = require('./update-rules');

class MVTSCore {
  constructor(config = {}) {
    this.config = {
      storagePath: config.storagePath || './mvts-state.json',
      modelClient: config.modelClient || null,
      autoApplyRules: config.autoApplyRules !== false,
      ruleApplicationInterval: config.ruleApplicationInterval || 60000, // 1 minute
      ...config
    };

    // Initialize core modules
    this.stateStore = new StateStore(this.config.storagePath);
    this.planner = new Planner(this.stateStore, this.config.modelClient);
    this.outcomeEvaluator = new OutcomeEvaluator(this.stateStore);
    this.updateRules = new UpdateRules(this.stateStore);

    // Start rule application loop
    if (this.config.autoApplyRules) {
      this.startRuleLoop();
    }

    // Initialize system beliefs
    this.initializeSystemBeliefs();
  }

  // Main cognitive loop - the closed loop that enables learning
  async cognitiveLoop(goal, context = {}) {
    const loopId = `loop_${Date.now()}`;
    const loopResult = {
      id: loopId,
      goal: goal,
      context: context,
      phases: [],
      success: false,
      learning: []
    };

    try {
      // Phase 1: Plan
      const planPhase = await this.executePlanPhase(goal, context);
      loopResult.phases.push(planPhase);

      if (!planPhase.success) {
        throw new Error('Planning phase failed');
      }

      // Phase 2: Execute
      const executionPhase = await this.executeExecutionPhase(planPhase.plan, context);
      loopResult.phases.push(executionPhase);

      // Phase 3: Evaluate
      const evaluationPhase = await this.executeEvaluationPhase(planPhase.plan, executionPhase.result);
      loopResult.phases.push(evaluationPhase);

      // Phase 4: Update State
      const updatePhase = await this.executeUpdatePhase(evaluationPhase.evaluation);
      loopResult.phases.push(updatePhase);

      // Phase 5: Learn
      const learningPhase = await this.executeLearningPhase(loopResult);
      loopResult.phases.push(learningPhase);

      loopResult.success = executionPhase.result.success || false;
      loopResult.learning = learningPhase.insights;

    } catch (error) {
      loopResult.error = error.message;
      loopResult.success = false;
    }

    return loopResult;
  }

  async executePlanPhase(goal, context) {
    const phase = {
      name: 'planning',
      success: false,
      plan: null,
      reasoning: []
    };

    try {
      // Create goal if it doesn't exist
      const goalId = `goal_${Date.now()}`;
      this.stateStore.addGoal(goalId, goal.description, goal.priority || 'medium');

      // Generate plan
      const plan = await this.planner.createPlan(
        { id: goalId, ...goal },
        context
      );

      phase.plan = plan;
      phase.success = true;
      phase.reasoning.push(`Created plan ${plan.id} with ${plan.steps.length} steps`);

    } catch (error) {
      phase.error = error.message;
      phase.reasoning.push(`Planning failed: ${error.message}`);
    }

    return phase;
  }

  async executeExecutionPhase(plan, context) {
    const phase = {
      name: 'execution',
      success: false,
      result: null,
      steps_executed: []
    };

    try {
      // Update plan status
      plan.status = 'executing';

      // Execute each step
      for (let i = 0; i < plan.steps.length; i++) {
        const stepResult = await this.planner.executeStep(
          plan.id,
          i,
          this.createStepExecutor(context)
        );

        phase.steps_executed.push(stepResult);

        // Stop execution if step failed
        if (!stepResult.success) {
          phase.result = {
            success: false,
            error: `Step ${i} failed: ${stepResult.result.error}`,
            partial_completion: i / plan.steps.length
          };
          break;
        }
      }

      // If all steps succeeded
      if (phase.steps_executed.every(step => step.success)) {
        phase.result = {
          success: true,
          completion_percentage: 100,
          quality_score: this.calculateQualityScore(phase.steps_executed)
        };
      }

      phase.success = phase.result.success || false;

    } catch (error) {
      phase.error = error.message;
      phase.result = {
        success: false,
        error: error.message
      };
    }

    return phase;
  }

  async executeEvaluationPhase(plan, executionResult) {
    const phase = {
      name: 'evaluation',
      success: false,
      evaluation: null
    };

    try {
      const evaluation = this.outcomeEvaluator.evaluatePlanOutcome(plan, executionResult);
      phase.evaluation = evaluation;
      phase.success = true;

    } catch (error) {
      phase.error = error.message;
      phase.success = false;
    }

    return phase;
  }

  async executeUpdatePhase(evaluation) {
    const phase = {
      name: 'state_update',
      success: false,
      actions_taken: []
    };

    try {
      // Apply evaluation to state store
      this.outcomeEvaluator.applyEvaluation(evaluation);

      // Apply deterministic rules
      const ruleActions = this.updateRules.applyRules();
      phase.actions_taken = ruleActions;

      phase.success = true;

    } catch (error) {
      phase.error = error.message;
      phase.success = false;
    }

    return phase;
  }

  async executeLearningPhase(loopResult) {
    const phase = {
      name: 'learning',
      success: false,
      insights: []
    };

    try {
      // Extract learning insights from the loop
      const insights = this.extractLearningInsights(loopResult);
      phase.insights = insights;
      phase.success = true;

    } catch (error) {
      phase.error = error.message;
      phase.success = false;
    }

    return phase;
  }

  // Helper methods
  createStepExecutor(context) {
    return async (step, plan) => {
      // Mock executor - in real implementation, this would execute actual actions
      const successProbability = this.calculateStepSuccessProbability(step, plan);
      const success = Math.random() < successProbability;

      return {
        success,
        result: success ? 
          { message: `Successfully executed: ${step}`, duration: Math.random() * 1000 } :
          { error: `Failed to execute: ${step}`, duration: Math.random() * 500 },
        timestamp: new Date().toISOString()
      };
    };
  }

  calculateStepSuccessProbability(step, plan) {
    // Base probability
    let probability = 0.7;

    // Adjust based on strategy effectiveness
    if (plan.strategy) {
      const strategies = this.stateStore.getEffectiveStrategies();
      const strategy = strategies.find(s => s.description.includes(plan.strategy));
      if (strategy) {
        probability = strategy.success_rate;
      }
    }

    // Adjust based on failure patterns
    const failures = this.stateStore.getFailurePatterns();
    for (const failure of failures) {
      if (step.toLowerCase().includes(failure.pattern.toLowerCase())) {
        probability -= (failure.frequency * 0.05);
      }
    }

    return Math.max(0.1, Math.min(0.95, probability));
  }

  calculateQualityScore(steps) {
    if (steps.length === 0) return 0;
    
    const successRate = steps.filter(s => s.success).length / steps.length;
    const avgDuration = steps.reduce((sum, s) => sum + (s.result.duration || 0), 0) / steps.length;
    
    // Quality based on success and efficiency
    const durationScore = Math.max(0.5, 1 - (avgDuration / 2000)); // Normalize to 2s max
    return (successRate + durationScore) / 2;
  }

  extractLearningInsights(loopResult) {
    const insights = [];

    // Strategy effectiveness insights
    const plan = loopResult.phases.find(p => p.name === 'planning')?.plan;
    const execution = loopResult.phases.find(p => p.name === 'execution');
    const evaluation = loopResult.phases.find(p => p.name === 'evaluation')?.evaluation;

    if (plan && plan.strategy && evaluation) {
      insights.push({
        type: 'strategy_learning',
        strategy: plan.strategy,
        effectiveness: evaluation.success_score,
        outcome: evaluation.outcome,
        insight: evaluation.success_score > 0.8 ? 
          `${plan.strategy} strategy is highly effective` :
          evaluation.success_score < 0.4 ? 
          `${plan.strategy} strategy needs improvement` :
          `${plan.strategy} strategy shows mixed results`
      });
    }

    // Goal difficulty insights
    if (plan && evaluation) {
      insights.push({
        type: 'goal_difficulty',
        goal: plan.goal_id,
        difficulty: 1 - evaluation.success_score,
        insight: evaluation.success_score > 0.7 ? 
          'Goal is achievable with current strategies' :
          evaluation.success_score < 0.3 ? 
          'Goal may be too difficult or needs different approach' :
          'Goal requires refined strategy'
      });
    }

    // Failure pattern insights
    if (evaluation && evaluation.failure_signatures.length > 0) {
      insights.push({
        type: 'failure_pattern',
        patterns: evaluation.failure_signatures,
        insight: `Identified ${evaluation.failure_signatures.length} failure patterns to avoid`
      });
    }

    return insights;
  }

  initializeSystemBeliefs() {
    // Add initial system beliefs
    this.stateStore.addBelief(
      'system_purpose',
      'MVTS enables persistent learning and adaptive planning',
      0.9,
      [{ type: 'system_initialization', timestamp: new Date().toISOString() }]
    );

    this.stateStore.addBelief(
      'strategy_learning',
      'Strategies improve through outcome-based feedback',
      0.8,
      [{ type: 'system_initialization', timestamp: new Date().toISOString() }]
    );

    this.stateStore.addBelief(
      'failure_avoidance',
      'Failure patterns should be identified and avoided',
      0.85,
      [{ type: 'system_initialization', timestamp: new Date().toISOString() }]
    );
  }

  startRuleLoop() {
    this.ruleInterval = setInterval(() => {
      try {
        this.updateRules.applyRules();
      } catch (error) {
        console.error('Error in rule application loop:', error);
      }
    }, this.config.ruleApplicationInterval);
  }

  stopRuleLoop() {
    if (this.ruleInterval) {
      clearInterval(this.ruleInterval);
      this.ruleInterval = null;
    }
  }

  // Public API methods
  async processGoal(goal, context = {}) {
    return await this.cognitiveLoop(goal, context);
  }

  getSystemStatus() {
    return {
      state_health: this.stateStore.getSystemHealth(),
      active_plans: this.planner.getActivePlans().length,
      completed_plans: this.planner.getCompletedPlans().length,
      rule_stats: this.updateRules.getRuleStatistics(),
      last_update: new Date().toISOString()
    };
  }

  getStateSnapshot() {
    return {
      state: this.stateStore.exportState(),
      plans: Array.from(this.planner.activePlans.values()),
      system_status: this.getSystemStatus()
    };
  }

  shutdown() {
    this.stopRuleLoop();
    this.stateStore.saveState();
  }
}

module.exports = MVTSCore;
