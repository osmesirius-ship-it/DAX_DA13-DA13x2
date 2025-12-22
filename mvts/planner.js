// MVTS Planner (Model-assisted, Server-owned)
// Creates, stores, and manages plans independent of LLM calls

class Planner {
  constructor(stateStore, modelClient) {
    this.stateStore = stateStore;
    this.modelClient = modelClient; // For plan generation assistance
    this.activePlans = new Map();
  }

  // Main planning loop - server owns this, LLM assists
  async createPlan(goal, context = {}) {
    const planId = `plan_${Date.now()}`;
    
    // Get relevant state
    const activeGoals = this.stateStore.getActiveGoals();
    const effectiveStrategies = this.stateStore.getEffectiveStrategies();
    const failurePatterns = this.stateStore.getFailurePatterns();
    const constraints = this.stateStore.getConstraints('hard');
    
    // Generate candidate plans (LLM-assisted)
    const candidates = await this.generateCandidatePlans(goal, context, {
      activeGoals,
      effectiveStrategies,
      failurePatterns,
      constraints
    });
    
    // Score and select best plan (server-owned logic)
    const scoredPlans = candidates.map(plan => ({
      ...plan,
      score: this.scorePlan(plan, goal, context)
    }));
    
    const bestPlan = scoredPlans.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    // Store plan in state
    const plan = {
      id: planId,
      goal_id: goal.id,
      description: bestPlan.description,
      steps: bestPlan.steps,
      strategy: bestPlan.strategy,
      estimated_success: bestPlan.estimated_success,
      status: 'planned',
      created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      execution_history: []
    };
    
    this.activePlans.set(planId, plan);
    
    // Store strategy usage for learning
    if (bestPlan.strategy) {
      this.stateStore.addStrategy(
        `strategy_${planId}`,
        bestPlan.strategy,
        bestPlan.estimated_success,
        goal.description.includes('code') ? 'technical' : 'general'
      );
    }
    
    return plan;
  }

  // LLM-assisted candidate generation
  async generateCandidatePlans(goal, context, state) {
    const prompt = `Generate 3 different approaches to achieve this goal.

Goal: ${goal.description}
Context: ${JSON.stringify(context, null, 2)}

Available strategies: ${state.effectiveStrategies.map(s => s.description).join(', ')}
Known failure patterns: ${state.failurePatterns.map(f => f.pattern).join(', ')}
Constraints: ${state.constraints.map(c => c.constraint).join(', ')}

Respond with JSON array of plans:
[
  {
    "description": "Brief description of approach",
    "strategy": "Strategy name or 'new'",
    "steps": ["step1", "step2", "step3"],
    "estimated_success": 0.8,
    "reasoning": "Why this approach should work"
  }
]`;

    try {
      const response = await this.modelClient.generate(prompt);
      const candidates = JSON.parse(response);
      return candidates.slice(0, 3); // Ensure max 3 candidates
    } catch (error) {
      console.error('Failed to generate candidates, using fallback:', error);
      return this.getFallbackPlans(goal);
    }
  }

  // Server-owned plan scoring (deterministic)
  scorePlan(plan, goal, context) {
    let score = 0.5; // Base score
    
    // Strategy effectiveness bonus
    if (plan.strategy !== 'new') {
      const strategies = this.stateStore.getEffectiveStrategies();
      const strategy = strategies.find(s => s.description.includes(plan.strategy));
      if (strategy) {
        score += strategy.success_rate * 0.3;
      }
    }
    
    // Failure pattern penalty
    const failures = this.stateStore.getFailurePatterns();
    for (const failure of failures) {
      if (plan.description.toLowerCase().includes(failure.pattern.toLowerCase()) ||
          plan.steps.some(step => step.toLowerCase().includes(failure.pattern.toLowerCase()))) {
        score -= (failure.frequency * 0.05); // Penalty based on failure frequency
      }
    }
    
    // Step complexity penalty
    if (plan.steps.length > 10) {
      score -= 0.1; // Too complex
    } else if (plan.steps.length < 2) {
      score -= 0.2; // Too simple
    }
    
    // Goal alignment bonus
    if (goal.priority === 'high') {
      score += 0.1;
    }
    
    // Constraint compliance
    const constraints = this.stateStore.getConstraints('hard');
    for (const constraint of constraints) {
      if (this.planViolatesConstraint(plan, constraint.constraint)) {
        score -= 0.3; // Major penalty for constraint violation
      }
    }
    
    return Math.max(0, Math.min(1, score));
  }

  planViolatesConstraint(plan, constraint) {
    const planText = `${plan.description} ${plan.steps.join(' ')}`.toLowerCase();
    return planText.includes(constraint.toLowerCase());
  }

  // Fallback plans when LLM fails
  getFallbackPlans(goal) {
    return [
      {
        description: `Direct approach to ${goal.description}`,
        strategy: 'direct',
        steps: ['Analyze requirements', 'Implement solution', 'Test and validate'],
        estimated_success: 0.6,
        reasoning: 'Straightforward execution'
      },
      {
        description: `Incremental approach to ${goal.description}`,
        strategy: 'iterative',
        steps: ['Break down problem', 'Solve piece by piece', 'Integrate results'],
        estimated_success: 0.7,
        reasoning: 'Reduces complexity through iteration'
      },
      {
        description: `Research-based approach to ${goal.description}`,
        strategy: 'research_first',
        steps: ['Research best practices', 'Plan implementation', 'Execute with guidance'],
        estimated_success: 0.8,
        reasoning: 'Leverages existing knowledge'
      }
    ];
  }

  // Execute plan step
  async executeStep(planId, stepIndex, executor) {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    
    if (stepIndex >= plan.steps.length) {
      throw new Error(`Step ${stepIndex} out of range for plan ${planId}`);
    }
    
    const step = plan.steps[stepIndex];
    const stepId = `${planId}_step_${stepIndex}`;
    
    try {
      // Execute the step using provided executor
      const result = await executor(step, plan);
      
      // Record execution
      const execution = {
        step_index: stepIndex,
        step: step,
        result: result,
        success: result.success || false,
        timestamp: new Date().toISOString(),
        duration: result.duration || 0
      };
      
      plan.execution_history.push(execution);
      plan.last_updated = new Date().toISOString();
      
      // Update strategy usage
      if (plan.strategy) {
        const strategies = this.stateStore.getEffectiveStrategies();
        const strategy = strategies.find(s => s.description.includes(plan.strategy));
        if (strategy) {
          this.stateStore.recordStrategyUsage(strategy.id, execution.success);
        }
      }
      
      // Record failure if step failed
      if (!execution.success) {
        this.stateStore.recordFailure(
          `plan_${planId}_step_${stepIndex}`,
          result.error || 'Unknown error'
        );
      }
      
      // Update plan status
      if (execution.success && stepIndex === plan.steps.length - 1) {
        plan.status = 'completed';
        // Update goal status
        if (plan.goal_id) {
          this.stateStore.updateGoalStatus(plan.goal_id, 'completed', 100);
        }
      } else if (!execution.success) {
        plan.status = 'failed';
        // Update goal status
        if (plan.goal_id) {
          this.stateStore.updateGoalStatus(plan.goal_id, 'failed');
        }
      }
      
      return execution;
      
    } catch (error) {
      // Record execution failure
      const execution = {
        step_index: stepIndex,
        step: step,
        result: { error: error.message },
        success: false,
        timestamp: new Date().toISOString(),
        duration: 0
      };
      
      plan.execution_history.push(execution);
      plan.status = 'failed';
      
      // Record failure pattern
      this.stateStore.recordFailure(
        `plan_${planId}_step_${stepIndex}`,
        error.message
      );
      
      throw error;
    }
  }

  // Get plan status
  getPlan(planId) {
    return this.activePlans.get(planId) || null;
  }

  // Get all active plans
  getActivePlans() {
    return Array.from(this.activePlans.values())
      .filter(plan => plan.status === 'planned' || plan.status === 'executing');
  }

  // Get completed plans for learning
  getCompletedPlans() {
    return Array.from(this.activePlans.values())
      .filter(plan => plan.status === 'completed' || plan.status === 'failed');
  }

  // Plan adaptation based on outcomes
  async adaptPlan(planId, feedback) {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    
    // Analyze what went wrong/right
    const successfulSteps = plan.execution_history.filter(e => e.success);
    const failedSteps = plan.execution_history.filter(e => !e.success);
    
    // Create adapted plan
    const adaptedPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      description: `${plan.description} (adapted)`,
      status: 'planned',
      created: new Date().toISOString(),
      execution_history: [],
      adaptations: []
    };
    
    // Remove failed steps and add alternatives
    if (failedSteps.length > 0) {
      adaptedPlan.steps = plan.steps.filter((step, index) => 
        !failedSteps.some(failed => failed.step_index === index)
      );
      
      // Add alternative steps for failures
      for (const failedStep of failedSteps) {
        const alternatives = await this.generateAlternatives(failedStep.step, feedback);
        adaptedPlan.steps.push(...alternatives);
        adaptedPlan.adaptations.push(`Replaced failed step: ${failedStep.step}`);
      }
    }
    
    // Store adapted plan
    this.activePlans.set(adaptedPlan.id, adaptedPlan);
    
    return adaptedPlan;
  }

  async generateAlternatives(failedStep, feedback) {
    // Simple alternative generation - could be enhanced with LLM
    const alternatives = [];
    
    if (failedStep.includes('implement')) {
      alternatives.push('Review implementation approach', 'Try different implementation method');
    } else if (failedStep.includes('test')) {
      alternatives.push('Run different tests', 'Validate with alternative method');
    } else {
      alternatives.push('Review requirements', 'Simplify approach', 'Seek additional resources');
    }
    
    return alternatives.slice(0, 2); // Limit to 2 alternatives
  }
}

module.exports = Planner;
