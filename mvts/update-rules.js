// MVTS Update Rules (Brainstem)
// Deterministic rules for state updates - no LLM involvement

class UpdateRules {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return {
      // Strategy failure rules
      strategyFailure: [
        {
          condition: (strategy, failures) => failures >= 3,
          action: 'demote_strategy_priority',
          effect: 'Reduce strategy confidence by 30%'
        },
        {
          condition: (strategy, failures) => failures >= 5,
          action: 'suspend_strategy',
          effect: 'Mark strategy as suspended'
        }
      ],
      
      // Belief confidence rules
      beliefConfidence: [
        {
          condition: (belief) => belief.confidence < 0.2,
          action: 'flag_low_confidence',
          effect: 'Mark belief for review'
        },
        {
          condition: (belief) => belief.confidence > 0.9,
          action: 'lock_high_confidence',
          effect: 'Prevent automatic confidence reduction'
        },
        {
          condition: (belief, contradictions) => contradictions.length >= 2,
          action: 'reduce_confidence_on_contradiction',
          effect: 'Reduce confidence by 20% per contradiction'
        }
      ],
      
      // Goal progression rules
      goalProgression: [
        {
          condition: (goal) => goal.status === 'failed' && goal.priority === 'high',
          action: 'escalate_goal_review',
          effect: 'Flag for human review'
        },
        {
          condition: (goal) => goal.status === 'completed' && goal.priority === 'high',
          action: 'create_followup_goal',
          effect: 'Generate related goal for continued progress'
        },
        {
          condition: (goal) => goal.status === 'active' && this.isGoalStale(goal),
          action: 'suspend_stale_goal',
          effect: 'Suspend inactive goals'
        }
      ],
      
      // Failure pattern rules
      failurePatterns: [
        {
          condition: (pattern) => pattern.frequency >= 3,
          action: 'create_constraint',
          effect: 'Create constraint to avoid failure pattern'
        },
        {
          condition: (pattern) => pattern.frequency >= 5,
          action: 'flag_systemic_issue',
          effect: 'Flag for system-level review'
        }
      ],
      
      // Resource optimization rules
      resourceOptimization: [
        {
          condition: (state) => this.calculateSystemLoad(state) > 0.8,
          action: 'prioritize_critical_goals',
          effect: 'Suspend low-priority goals'
        },
        {
          condition: (state) => this.calculateSystemLoad(state) < 0.3,
          action: 'enable_exploration',
          effect: 'Allow experimental strategies'
        }
      ]
    };
  }

  // Apply all applicable rules to current state
  applyRules() {
    const state = this.stateStore.exportState();
    const actions = [];

    // Apply strategy failure rules
    actions.push(...this.applyStrategyRules(state.strategies));

    // Apply belief confidence rules
    actions.push(...this.applyBeliefRules(state.beliefs));

    // Apply goal progression rules
    actions.push(...this.applyGoalRules(state.goals));

    // Apply failure pattern rules
    actions.push(...this.applyFailurePatternRules(state.failure_patterns));

    // Apply resource optimization rules
    actions.push(...this.applyResourceRules(state));

    return actions;
  }

  applyStrategyRules(strategies) {
    const actions = [];

    for (const strategy of strategies) {
      for (const rule of this.rules.strategyFailure) {
        if (rule.condition(strategy, strategy.failures)) {
          const action = this.executeStrategyRule(rule, strategy);
          actions.push(action);
        }
      }
    }

    return actions;
  }

  applyBeliefRules(beliefs) {
    const actions = [];

    for (const [beliefId, belief] of Object.entries(beliefs)) {
      // Count contradictions
      const contradictions = this.findContradictions(beliefId, belief, beliefs);
      
      for (const rule of this.rules.beliefConfidence) {
        if (rule.condition(belief, contradictions)) {
          const action = this.executeBeliefRule(rule, beliefId, belief, contradictions);
          actions.push(action);
        }
      }
    }

    return actions;
  }

  applyGoalRules(goals) {
    const actions = [];

    for (const [goalId, goal] of Object.entries(goals)) {
      for (const rule of this.rules.goalProgression) {
        if (rule.condition(goal)) {
          const action = this.executeGoalRule(rule, goalId, goal);
          actions.push(action);
        }
      }
    }

    return actions;
  }

  applyFailurePatternRules(failurePatterns) {
    const actions = [];

    for (const pattern of failurePatterns) {
      for (const rule of this.rules.failurePatterns) {
        if (rule.condition(pattern)) {
          const action = this.executeFailurePatternRule(rule, pattern);
          actions.push(action);
        }
      }
    }

    return actions;
  }

  applyResourceRules(state) {
    const actions = [];

    for (const rule of this.rules.resourceOptimization) {
      if (rule.condition(state)) {
        const action = this.executeResourceRule(rule, state);
        actions.push(action);
      }
    }

    return actions;
  }

  // Rule execution methods
  executeStrategyRule(rule, strategy) {
    const action = {
      type: 'strategy_update',
      rule: rule.action,
      strategy_id: strategy.id,
      effect: rule.effect,
      timestamp: new Date().toISOString()
    };

    switch (rule.action) {
      case 'demote_strategy_priority':
        // Reduce confidence by 30%
        const newConfidence = Math.max(0.1, strategy.success_rate - 0.3);
        // This would update the strategy in state store
        break;
        
      case 'suspend_strategy':
        // Mark strategy as suspended
        break;
    }

    return action;
  }

  executeBeliefRule(rule, beliefId, belief, contradictions) {
    const action = {
      type: 'belief_update',
      rule: rule.action,
      belief_id: beliefId,
      effect: rule.effect,
      timestamp: new Date().toISOString()
    };

    switch (rule.action) {
      case 'flag_low_confidence':
        // Mark belief for review
        break;
        
      case 'lock_high_confidence':
        // Prevent automatic confidence reduction
        break;
        
      case 'reduce_confidence_on_contradiction':
        // Reduce confidence by 20% per contradiction
        const totalReduction = contradictions.length * 0.2;
        this.stateStore.updateBeliefConfidence(beliefId, -totalReduction, `Contradicted by ${contradictions.length} beliefs`);
        break;
    }

    return action;
  }

  executeGoalRule(rule, goalId, goal) {
    const action = {
      type: 'goal_update',
      rule: rule.action,
      goal_id: goalId,
      effect: rule.effect,
      timestamp: new Date().toISOString()
    };

    switch (rule.action) {
      case 'escalate_goal_review':
        // Flag for human review
        break;
        
      case 'create_followup_goal':
        // Generate related goal
        const followupId = `goal_${Date.now()}`;
        this.stateStore.addGoal(
          followupId,
          `Follow-up to: ${goal.description}`,
          goal.priority,
          'active'
        );
        action.created_goal = followupId;
        break;
        
      case 'suspend_stale_goal':
        // Suspend inactive goals
        this.stateStore.updateGoalStatus(goalId, 'suspended');
        break;
    }

    return action;
  }

  executeFailurePatternRule(rule, pattern) {
    const action = {
      type: 'failure_pattern_update',
      rule: rule.action,
      pattern_id: pattern.id,
      effect: rule.effect,
      timestamp: new Date().toISOString()
    };

    switch (rule.action) {
      case 'create_constraint':
        // Create constraint to avoid failure pattern
        const constraintId = `constraint_${Date.now()}`;
        this.stateStore.addConstraint(
          `Avoid: ${pattern.pattern}`,
          'hard'
        );
        action.created_constraint = constraintId;
        break;
        
      case 'flag_systemic_issue':
        // Flag for system-level review
        break;
    }

    return action;
  }

  executeResourceRule(rule, state) {
    const action = {
      type: 'resource_update',
      rule: rule.action,
      effect: rule.effect,
      timestamp: new Date().toISOString()
    };

    switch (rule.action) {
      case 'prioritize_critical_goals':
        // Suspend low-priority goals
        const goals = Object.entries(state.goals);
        for (const [goalId, goal] of goals) {
          if (goal.priority === 'low' && goal.status === 'active') {
            this.stateStore.updateGoalStatus(goalId, 'suspended');
          }
        }
        break;
        
      case 'enable_exploration':
        // Allow experimental strategies
        break;
    }

    return action;
  }

  // Helper methods
  findContradictions(beliefId, belief, allBeliefs) {
    const contradictions = [];
    
    for (const [otherId, otherBelief] of Object.entries(allBeliefs)) {
      if (otherId !== beliefId && this.areBeliefsContradictory(belief, otherBelief)) {
        contradictions.push(otherId);
      }
    }
    
    return contradictions;
  }

  areBeliefsContradictory(belief1, belief2) {
    // Simple contradiction detection - could be enhanced
    const claim1 = belief1.claim.toLowerCase();
    const claim2 = belief2.claim.toLowerCase();
    
    // Check for opposite statements
    const opposites = [
      ['effective', 'ineffective'],
      ['safe', 'unsafe'],
      ['reliable', 'unreliable'],
      ['recommended', 'not recommended']
    ];
    
    for (const [positive, negative] of opposites) {
      if ((claim1.includes(positive) && claim2.includes(negative)) ||
          (claim1.includes(negative) && claim2.includes(positive))) {
        return true;
      }
    }
    
    return false;
  }

  isGoalStale(goal) {
    if (!goal.last_updated) return false;
    
    const lastUpdated = new Date(goal.last_updated);
    const now = new Date();
    const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate > 7; // Goals stale after 7 days
  }

  calculateSystemLoad(state) {
    // Simple load calculation based on active goals and strategies
    const activeGoals = Object.values(state.goals).filter(g => g.status === 'active').length;
    const totalGoals = Object.keys(state.goals).length;
    const activeStrategies = state.strategies.filter(s => s.success_rate > 0.5).length;
    
    // Normalize to 0-1 range
    const goalLoad = totalGoals > 0 ? activeGoals / totalGoals : 0;
    const strategyLoad = Math.min(1, activeStrategies / 10); // Cap at 10 strategies
    
    return (goalLoad + strategyLoad) / 2;
  }

  // Get rule statistics
  getRuleStatistics() {
    const stats = {
      total_rules: 0,
      rules_by_type: {},
      recent_actions: []
    };

    for (const [ruleType, rules] of Object.entries(this.rules)) {
      stats.rules_by_type[ruleType] = rules.length;
      stats.total_rules += rules.length;
    }

    return stats;
  }

  // Add custom rule
  addCustomRule(category, condition, action, effect) {
    if (!this.rules[category]) {
      this.rules[category] = [];
    }
    
    this.rules[category].push({
      condition,
      action,
      effect
    });
  }

  // Remove rule
  removeRule(category, actionName) {
    if (this.rules[category]) {
      this.rules[category] = this.rules[category].filter(
        rule => rule.action !== actionName
      );
    }
  }
}

module.exports = UpdateRules;
