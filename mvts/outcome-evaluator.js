// MVTS Outcome Evaluator (Reality Check)
// Evaluates execution outcomes and generates learning signals

class OutcomeEvaluator {
  constructor(stateStore) {
    this.stateStore = stateStore;
  }

  // Evaluate plan execution outcome
  evaluatePlanOutcome(plan, executionResult) {
    const evaluation = {
      plan_id: plan.id,
      outcome: 'unknown',
      success_score: 0,
      confidence_delta: 0,
      strategy_penalties: [],
      belief_updates: [],
      failure_signatures: [],
      learning_signals: []
    };

    // Determine outcome type
    evaluation.outcome = this.determineOutcome(executionResult);
    
    // Calculate success score
    evaluation.success_score = this.calculateSuccessScore(executionResult);
    
    // Generate confidence updates for beliefs
    evaluation.belief_updates = this.generateBeliefUpdates(plan, evaluation);
    
    // Calculate strategy penalties
    evaluation.strategy_penalties = this.calculateStrategyPenalties(plan, evaluation);
    
    // Extract failure signatures
    evaluation.failure_signatures = this.extractFailureSignatures(plan, executionResult);
    
    // Generate learning signals
    evaluation.learning_signals = this.generateLearningSignals(plan, evaluation);

    return evaluation;
  }

  determineOutcome(executionResult) {
    if (executionResult.success === true) {
      return 'success';
    } else if (executionResult.success === false) {
      return 'failure';
    } else if (executionResult.partial === true) {
      return 'partial';
    } else if (executionResult.error) {
      return 'error';
    } else {
      return 'unknown';
    }
  }

  calculateSuccessScore(executionResult) {
    let score = 0.5; // Default neutral score

    // Direct success indicator
    if (executionResult.success === true) {
      score = 1.0;
    } else if (executionResult.success === false) {
      score = 0.0;
    }

    // Partial success adjustments
    if (executionResult.partial === true) {
      score = 0.5;
      if (executionResult.completion_percentage) {
        score = executionResult.completion_percentage / 100;
      }
    }

    // Quality indicators
    if (executionResult.quality_score) {
      score = (score + executionResult.quality_score) / 2;
    }

    // Time efficiency
    if (executionResult.expected_duration && executionResult.actual_duration) {
      const efficiency = executionResult.expected_duration / executionResult.actual_duration;
      score = score * Math.min(1.2, Math.max(0.8, efficiency));
    }

    // Resource efficiency
    if (executionResult.resource_usage && executionResult.resource_efficiency) {
      score = score * executionResult.resource_efficiency;
    }

    return Math.max(0, Math.min(1, score));
  }

  generateBeliefUpdates(plan, evaluation) {
    const updates = [];

    // Update beliefs about the domain
    const domainBeliefs = this.extractDomainBeliefs(plan);
    for (const beliefId of domainBeliefs) {
      const belief = this.stateStore.getBelief(beliefId);
      if (belief) {
        // Success reinforces beliefs, failure weakens them
        const delta = evaluation.success_score > 0.6 ? 0.1 : 
                     evaluation.success_score < 0.4 ? -0.1 : 0;
        
        if (Math.abs(delta) > 0.01) {
          updates.push({
            belief_id: beliefId,
            delta: delta,
            reason: `Plan ${evaluation.outcome}: ${plan.description}`
          });
        }
      }
    }

    // Create new beliefs from successful patterns
    if (evaluation.success_score > 0.8) {
      const newBeliefId = `belief_${Date.now()}`;
      updates.push({
        new_belief: {
          id: newBeliefId,
          claim: `${plan.strategy} strategy is effective for ${plan.goal_id}`,
          confidence: 0.6,
          evidence: [{
            type: 'successful_execution',
            plan_id: plan.id,
            success_score: evaluation.success_score,
            timestamp: new Date().toISOString()
          }]
        }
      });
    }

    return updates;
  }

  extractDomainBeliefs(plan) {
    // Extract belief IDs relevant to the plan's domain
    const beliefs = [];
    
    // Look for beliefs related to strategy
    if (plan.strategy) {
      const allBeliefs = this.stateStore.exportState().beliefs;
      for (const [id, belief] of Object.entries(allBeliefs)) {
        if (belief.claim.includes(plan.strategy) || 
            belief.claim.includes(plan.goal_id)) {
          beliefs.push(id);
        }
      }
    }
    
    return beliefs;
  }

  calculateStrategyPenalties(plan, evaluation) {
    const penalties = [];

    if (plan.strategy && evaluation.success_score < 0.5) {
      penalties.push({
        strategy_id: plan.strategy,
        penalty: 0.2, // 20% confidence penalty
        reason: `Plan failed with ${evaluation.outcome} outcome`
      });
    }

    // Additional penalties for specific failure types
    if (evaluation.failure_signatures) {
      for (const signature of evaluation.failure_signatures) {
        if (signature.severity === 'high') {
          penalties.push({
            strategy_id: plan.strategy,
            penalty: 0.1,
            reason: `High severity failure: ${signature.pattern}`
          });
        }
      }
    }

    return penalties;
  }

  extractFailureSignatures(plan, executionResult) {
    const signatures = [];

    if (executionResult.error) {
      signatures.push({
        pattern: executionResult.error,
        severity: 'high',
        context: plan.description,
        frequency: 1
      });
    }

    // Extract patterns from failed steps
    if (plan.execution_history) {
      const failedSteps = plan.execution_history.filter(step => !step.success);
      for (const failedStep of failedSteps) {
        if (failedStep.result && failedStep.result.error) {
          signatures.push({
            pattern: failedStep.result.error,
            severity: 'medium',
            context: failedStep.step,
            frequency: 1
          });
        }
      }
    }

    return signatures;
  }

  generateLearningSignals(plan, evaluation) {
    const signals = [];

    // Strategy effectiveness signal
    if (plan.strategy) {
      signals.push({
        type: 'strategy_effectiveness',
        strategy: plan.strategy,
        effectiveness: evaluation.success_score,
        context: plan.goal_id,
        timestamp: new Date().toISOString()
      });
    }

    // Goal difficulty signal
    signals.push({
      type: 'goal_difficulty',
      goal_id: plan.goal_id,
      difficulty: 1 - evaluation.success_score,
      strategy_used: plan.strategy,
      timestamp: new Date().toISOString()
    });

    // Constraint violation signals
    const constraintViolations = this.detectConstraintViolations(plan, evaluation);
    for (const violation of constraintViolations) {
      signals.push({
        type: 'constraint_violation',
        constraint: violation.constraint,
        severity: violation.severity,
        context: plan.description,
        timestamp: new Date().toISOString()
      });
    }

    // Resource efficiency signals
    if (evaluation.success_score > 0.6 && executionResult.resource_usage) {
      signals.push({
        type: 'resource_efficiency',
        efficiency: executionResult.resource_efficiency || 0.5,
        resources_used: executionResult.resource_usage,
        context: plan.description,
        timestamp: new Date().toISOString()
      });
    }

    return signals;
  }

  detectConstraintViolations(plan, evaluation) {
    const violations = [];
    const constraints = this.stateStore.getConstraints('hard');

    for (const constraint of constraints) {
      if (this.planViolatesConstraint(plan, constraint.constraint)) {
        violations.push({
          constraint: constraint.constraint,
          severity: evaluation.success_score < 0.3 ? 'high' : 'medium'
        });
      }
    }

    return violations;
  }

  planViolatesConstraint(plan, constraint) {
    const planText = `${plan.description} ${plan.steps.join(' ')}`.toLowerCase();
    return planText.includes(constraint.toLowerCase());
  }

  // Apply evaluation results to state
  applyEvaluation(evaluation) {
    // Update beliefs
    for (const update of evaluation.belief_updates) {
      if (update.new_belief) {
        this.stateStore.addBelief(
          update.new_belief.id,
          update.new_belief.claim,
          update.new_belief.confidence,
          update.new_belief.evidence
        );
      } else {
        this.stateStore.updateBeliefConfidence(
          update.belief_id,
          update.delta,
          update.reason
        );
      }
    }

    // Apply strategy penalties
    for (const penalty of evaluation.strategy_penalties) {
      const strategies = this.stateStore.getEffectiveStrategies();
      const strategy = strategies.find(s => s.description.includes(penalty.strategy_id));
      if (strategy) {
        this.stateStore.recordStrategyUsage(strategy.id, false); // Record failure
      }
    }

    // Record failure patterns
    for (const signature of evaluation.failure_signatures) {
      this.stateStore.recordFailure(signature.context, signature.pattern);
    }

    // Store learning signals for analysis
    this.storeLearningSignals(evaluation.learning_signals);
  }

  storeLearningSignals(signals) {
    // In a real implementation, this would store signals for pattern analysis
    // For now, we'll just log them and potentially create beliefs from strong patterns
    for (const signal of signals) {
      if (signal.type === 'strategy_effectiveness' && signal.effectiveness > 0.8) {
        // Create belief about highly effective strategies
        const beliefId = `strategy_${signal.strategy}_effective`;
        this.stateStore.addBelief(
          beliefId,
          `${signal.strategy} strategy is highly effective`,
          signal.effectiveness,
          [{
            type: 'learning_signal',
            effectiveness: signal.effectiveness,
            context: signal.context,
            timestamp: signal.timestamp
          }]
        );
      }
    }
  }

  // Get evaluation summary for analysis
  getEvaluationSummary() {
    const state = this.stateStore.exportState();
    
    return {
      total_evaluations: this.totalEvaluations || 0,
      avg_success_rate: this.avgSuccessRate || 0,
      strategy_performance: this.strategyPerformance || {},
      common_failures: state.failure_patterns.slice(0, 5),
      belief_confidence_trends: this.calculateBeliefTrends(state.beliefs)
    };
  }

  calculateBeliefTrends(beliefs) {
    const trends = {};
    
    for (const [id, belief] of Object.entries(beliefs)) {
      const recentEvidence = belief.evidence.filter(e => 
        e.timestamp && new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (recentEvidence.length > 0) {
        const confidenceChanges = recentEvidence
          .filter(e => e.type === 'confidence_update')
          .reduce((sum, e) => sum + (e.delta || 0), 0);
        
        trends[id] = {
          current_confidence: belief.confidence,
          recent_change: confidenceChanges,
          trend: confidenceChanges > 0.1 ? 'increasing' : 
                 confidenceChanges < -0.1 ? 'decreasing' : 'stable'
        };
      }
    }
    
    return trends;
  }
}

module.exports = OutcomeEvaluator;
