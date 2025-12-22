// MVTS State Store (Belief Graph)
// Persistent structured state for Active Cognitive Substrate

class StateStore {
  constructor(storagePath = './mvts-state.json') {
    this.storagePath = storagePath;
    this.state = {
      beliefs: {},
      goals: {},
      constraints: [],
      strategies: [],
      failure_patterns: [],
      last_updated: new Date().toISOString()
    };
    this.loadState();
  }

  // Core belief operations
  addBelief(id, claim, confidence = 0.5, evidence = []) {
    this.state.beliefs[id] = {
      claim,
      confidence: Math.max(0, Math.min(1, confidence)),
      evidence,
      created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    this.saveState();
  }

  updateBeliefConfidence(id, delta, reason = '') {
    if (!this.state.beliefs[id]) return false;
    
    const oldConfidence = this.state.beliefs[id].confidence;
    this.state.beliefs[id].confidence = Math.max(0, Math.min(1, oldConfidence + delta));
    this.state.beliefs[id].last_updated = new Date().toISOString();
    
    if (reason) {
      this.state.beliefs[id].evidence.push({
        type: 'confidence_update',
        reason,
        delta,
        timestamp: new Date().toISOString()
      });
    }
    
    this.saveState();
    return true;
  }

  contradictBelief(id, contradictoryClaim, strength = 0.5) {
    if (!this.state.beliefs[id]) return false;
    
    // Reduce confidence based on contradiction strength
    const penalty = strength * 0.3; // Max 30% penalty per contradiction
    this.updateBeliefConfidence(id, -penalty, `Contradicted by: ${contradictoryClaim}`);
    
    return true;
  }

  getBelief(id) {
    return this.state.beliefs[id] || null;
  }

  getBeliefsByConfidence(minConfidence = 0.5) {
    return Object.entries(this.state.beliefs)
      .filter(([_, belief]) => belief.confidence >= minConfidence)
      .map(([id, belief]) => ({ id, ...belief }));
  }

  // Goal operations
  addGoal(id, description, priority = 'medium', status = 'active') {
    this.state.goals[id] = {
      description,
      priority, // high, medium, low
      status, // active, suspended, failed, completed
      created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      progress: 0
    };
    this.saveState();
  }

  updateGoalStatus(id, status, progress = null) {
    if (!this.state.goals[id]) return false;
    
    this.state.goals[id].status = status;
    this.state.goals[id].last_updated = new Date().toISOString();
    
    if (progress !== null) {
      this.state.goals[id].progress = Math.max(0, Math.min(100, progress));
    }
    
    this.saveState();
    return true;
  }

  getActiveGoals() {
    return Object.entries(this.state.goals)
      .filter(([_, goal]) => goal.status === 'active')
      .map(([id, goal]) => ({ id, ...goal }))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  // Strategy operations
  addStrategy(id, description, success_rate = 0.5, domain = 'general') {
    this.state.strategies.push({
      id,
      description,
      success_rate: Math.max(0, Math.min(1, success_rate)),
      domain,
      uses: 0,
      successes: 0,
      failures: 0,
      created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    });
    this.saveState();
  }

  recordStrategyUsage(id, success) {
    const strategy = this.state.strategies.find(s => s.id === id);
    if (!strategy) return false;
    
    strategy.uses++;
    if (success) {
      strategy.successes++;
    } else {
      strategy.failures++;
    }
    
    // Update success rate
    strategy.success_rate = strategy.successes / strategy.uses;
    strategy.last_updated = new Date().toISOString();
    
    this.saveState();
    return true;
  }

  getEffectiveStrategies(domain = null, minSuccessRate = 0.5) {
    let strategies = this.state.strategies;
    
    if (domain) {
      strategies = strategies.filter(s => s.domain === domain || s.domain === 'general');
    }
    
    return strategies
      .filter(s => s.success_rate >= minSuccessRate && s.uses >= 3) // At least 3 uses
      .sort((a, b) => b.success_rate - a.success_rate);
  }

  // Failure pattern operations
  addFailurePattern(pattern, frequency = 1, contexts = []) {
    this.state.failure_patterns.push({
      id: `failure_${Date.now()}`,
      pattern,
      frequency,
      contexts,
      created: new Date().toISOString(),
      last_seen: new Date().toISOString()
    });
    this.saveState();
  }

  recordFailure(context, pattern) {
    // Find existing pattern or create new
    let existingPattern = this.state.failure_patterns.find(p => p.pattern === pattern);
    
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.last_seen = new Date().toISOString();
      if (!existingPattern.contexts.includes(context)) {
        existingPattern.contexts.push(context);
      }
    } else {
      this.addFailurePattern(pattern, 1, [context]);
    }
    
    this.saveState();
  }

  getFailurePatterns(minFrequency = 2) {
    return this.state.failure_patterns
      .filter(p => p.frequency >= minFrequency)
      .sort((a, b) => b.frequency - a.frequency);
  }

  // Constraint operations
  addConstraint(constraint, type = 'hard') {
    this.state.constraints.push({
      id: `constraint_${Date.now()}`,
      constraint,
      type, // hard, soft, advisory
      created: new Date().toISOString()
    });
    this.saveState();
  }

  getConstraints(type = null) {
    if (type) {
      return this.state.constraints.filter(c => c.type === type);
    }
    return this.state.constraints;
  }

  // Persistence
  saveState() {
    this.state.last_updated = new Date().toISOString();
    try {
      const fs = require('fs');
      fs.writeFileSync(this.storagePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  loadState() {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8');
        this.state = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load state, using defaults:', error);
    }
  }

  // Analytics
  getSystemHealth() {
    const beliefCount = Object.keys(this.state.beliefs).length;
    const avgBeliefConfidence = beliefCount > 0 
      ? Object.values(this.state.beliefs).reduce((sum, b) => sum + b.confidence, 0) / beliefCount
      : 0;
    
    const activeGoals = this.getActiveGoals().length;
    const strategyCount = this.state.strategies.length;
    const avgStrategySuccess = strategyCount > 0
      ? this.state.strategies.reduce((sum, s) => sum + s.success_rate, 0) / strategyCount
      : 0;
    
    return {
      beliefs: { count: beliefCount, avg_confidence: avgBeliefConfidence },
      goals: { active: activeGoals },
      strategies: { count: strategyCount, avg_success: avgStrategySuccess },
      failures: { patterns: this.state.failure_patterns.length },
      last_updated: this.state.last_updated
    };
  }

  // Export for inspection
  exportState() {
    return JSON.parse(JSON.stringify(this.state));
  }
}

module.exports = StateStore;
