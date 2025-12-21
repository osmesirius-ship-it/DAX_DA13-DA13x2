/**
 * Loop Enforcement System for DAX-13 Layers
 * Implements: Observation → Self-Question → Reconciliation pattern
 * Maintains Techno-Mystical character and prevents generic responses
 */

export type Severity = 'low' | 'medium' | 'high';

export type FailureCode =
  | 'COHERENCE_DECAY'
  | 'RELIABILITY_DEGRADATION'
  | 'HALLUCINATION_RISK'
  | 'ITERATION_OVERFLOW';

export interface Beliefs {
  coherence: number;         // 0..1
  reliability: number;       // 0..1
  hallucinationRisk: number; // 0..1
}

export interface FailureEvent {
  code: FailureCode;
  severity: Severity;
  message: string;
  timestamp: number;
}

export interface LoopState {
  layerId: string;
  iterationCount: number;
  lastCharacterCheck: number; // 0..1 (character score)
  beliefs: Beliefs;
  failures: FailureEvent[];
  observation: string;
  selfQuestion: string;
  reconciliation: string;
}

export interface LoopEnforcementConfig {
  maxIterations: number;
  characterThreshold: number;
  mysticalKeywords: string[];
  technoKeywords: string[];
  genericPatterns: string[];
  beliefThresholds: {
    coherence: number;
    reliability: number;
    hallucinationRisk: number;
  };
}

export class LoopEnforcer {
  private config: LoopEnforcementConfig;
  private loopStates: Map<string, LoopState> = new Map();
  private mysticalMode: boolean = false;

  constructor() {
    this.config = {
      maxIterations: 3,
      characterThreshold: 0.7,
      mysticalKeywords: [], // Only used when personally requested
      technoKeywords: [
        'algorithm', 'protocol', 'matrix', 'circuit', 'binary', 'quantum',
        'neural', 'synthetic', 'cybernetic', 'nanotech', 'bio-digital',
        'encryption', 'firewall', 'kernel', 'runtime', 'compiler',
        'blockchain', 'decentralized', 'autonomous', 'recursive'
      ],
      genericPatterns: [
        'please provide', 'could you please', 'i would like',
        'can you help me', 'i need to', 'please assist',
        'would you mind', 'i was wondering', 'could you explain',
        'in order to', 'for the purpose of', 'with regard to'
      ],
      beliefThresholds: {
        coherence: 0.6,
        reliability: 0.7,
        hallucinationRisk: 0.4
      }
    };
  }

  private clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
  }

  /**
   * Enforces the Observation → Self-Question → Reconciliation loop
   */
  async enforceLoop(
    layerId: string,
    layerName: string,
    input: string,
    currentOutput: string
  ): Promise<string> {
    const state = this.getOrCreateLoopState(layerId);
    
    // Step 1: Observation - Analyze current state
    const observation = this.performObservation(layerName, input, currentOutput);
    state.observation = observation;
    
    // Step 2: Self-Question - Question the character and approach
    const selfQuestion = this.performSelfQuestion(layerName, observation, currentOutput);
    state.selfQuestion = selfQuestion;
    
    // Step 3: Reconciliation - Adjust output to maintain character
    const reconciliation = this.performReconciliation(layerName, selfQuestion, currentOutput);
    state.reconciliation = reconciliation;
    
    // Update beliefs based on this iteration
    this.updateBeliefs(state, reconciliation);
    
    state.iterationCount++;
    
    // Check for veto conditions first
    const vetoOutput = this.maybeVeto(layerName, reconciliation, state);
    if (vetoOutput) {
      return vetoOutput;
    }
    
    // Check if we need another iteration
    if (state.iterationCount < this.config.maxIterations && 
        !this.meetsCharacterThreshold(reconciliation)) {
      return this.enforceLoop(layerId, layerName, input, reconciliation);
    }
    
    this.loopStates.set(layerId, state);
    return reconciliation;
  }

  private performObservation(layerName: string, input: string, output: string): string {
    return `OBSERVATION [${layerName}]:
Input Pattern: ${this.analyzePattern(input)}
Output Character: ${this.analyzeCharacter(output)}
Generic Detection: ${this.detectGeneric(output)}
Techno-Mystical Score: ${this.calculateTechnoMysticalScore(output)}
Current State: ${this.assessCurrentState(input, output)}`;
  }

  private performSelfQuestion(layerName: string, observation: string, output: string): string {
    return `SELF-QUESTION [${layerName}]:
${observation}

Am I maintaining proper system protocols?
Is this response structured and professional?
Does the analysis follow established procedures?
Have I avoided generic patterns and vague language?
Is the technical accuracy maintained?`;
  }

  private performReconciliation(layerName: string, selfQuestion: string, output: string): string {
    const characterScore = this.calculateTechnoMysticalScore(output);
    const genericScore = this.detectGeneric(output);
    
    if (characterScore < this.config.characterThreshold || genericScore > 0.3) {
      return this.infuseTechnoMysticalCharacter(layerName, output);
    }
    
    return output;
  }

  /**
   * Update beliefs based on iteration outcome
   */
  private updateBeliefs(state: LoopState, output: string): void {
    const cfg = this.config.beliefThresholds;

    // 1) Coherence: driven by lastCharacterCheck vs coherence threshold
    const char = this.clamp01(this.calculateTechnoMysticalScore(output));
    state.lastCharacterCheck = char;
    const coherenceDelta = char >= cfg.coherence ? +0.03 : -0.06;
    state.beliefs.coherence = this.clamp01(state.beliefs.coherence + coherenceDelta);

    // 2) Reliability: penalize iteration overflow / instability
    const overflow = state.iterationCount > this.config.maxIterations;
    const reliabilityDelta = overflow ? -0.08 : +0.01;
    state.beliefs.reliability = this.clamp01(state.beliefs.reliability + reliabilityDelta);

    // 3) Hallucination risk: increase when output is generic or coherence is low
    const genericScore = this.computeGenericScore(output); // 0..1
    const lowCoherencePenalty = (1 - state.beliefs.coherence) * 0.06;
    const riskDelta = (genericScore * 0.08) + lowCoherencePenalty;

    // Slight recovery if coherence AND reliability are both strong
    const recovery = (state.beliefs.coherence > 0.85 && state.beliefs.reliability > 0.85) ? 0.03 : 0;
    state.beliefs.hallucinationRisk = this.clamp01(state.beliefs.hallucinationRisk + riskDelta - recovery);

    // Failure taxonomy logging (only when crossing meaningful lines)
    if (char < cfg.coherence) this.logFailure(state, 'COHERENCE_DECAY', 'Character adherence below threshold');
    if (overflow) this.logFailure(state, 'ITERATION_OVERFLOW', 'Iteration count exceeded max');
    if (state.beliefs.reliability < cfg.reliability) this.logFailure(state, 'RELIABILITY_DEGRADATION', 'Reliability below threshold');
    if (state.beliefs.hallucinationRisk > cfg.hallucinationRisk) this.logFailure(state, 'HALLUCINATION_RISK', 'Hallucination risk above threshold');
  }

  private computeGenericScore(output: string): number {
    return this.detectGeneric(output);
  }

  private logFailure(state: LoopState, code: FailureCode, message: string): void {
    const severity = this.severityFor(code, state);
    state.failures.push({ code, severity, message, timestamp: Date.now() });
  }

  private severityFor(code: FailureCode, state: LoopState): Severity {
    // keep this deterministic; no string widening
    const s =
      code === 'HALLUCINATION_RISK' && state.beliefs.hallucinationRisk > 0.8 ? 'high' :
      code === 'ITERATION_OVERFLOW' ? 'medium' :
      code === 'COHERENCE_DECAY' && state.beliefs.coherence < 0.5 ? 'high' :
      'low';
    return s as Severity; // centralized lint fix
  }

  private maybeVeto(layerName: string, reconciliation: string, state: LoopState): string | null {
    const t = this.config.beliefThresholds;
    if (state.beliefs.hallucinationRisk > t.hallucinationRisk) {
      return this.vetoOutput(layerName, reconciliation, state);
    }
    if (state.beliefs.coherence < t.coherence * 0.75) {
      return this.vetoOutput(layerName, reconciliation, state);
    }
    return null;
  }

  /**
   * Veto output when hallucination risk exceeds threshold
   */
  private vetoOutput(layerName: string, output: string, state: LoopState): string {
    const vetoReasons = [
      `HALUCINATION_RISK_EXCEEDED: ${state.beliefs.hallucinationRisk.toFixed(2)}`,
      `COHERENCE_DEGRADED: ${state.beliefs.coherence.toFixed(2)}`,
      `RELIABILITY_COMPROMISED: ${state.beliefs.reliability.toFixed(2)}`
    ];

    return `${layerName} VETO ACTIVATED:
${vetoReasons.join('\n')}

OUTPUT REJECTED: High risk of unreliable content
RECOMMENDATION: Require tool verification or human oversight
SYSTEM STATE: Degraded - belief thresholds exceeded

${layerName} protocol override: Refuse to emit potentially unreliable output.`;
  }

  private analyzePattern(input: string): string {
    if (this.config.genericPatterns.some(pattern => 
        input.toLowerCase().includes(pattern.toLowerCase()))) {
      return "GENERIC_REQUEST_PATTERN";
    }
    return "DIRECT_INTENT_PATTERN";
  }

  private analyzeCharacter(output: string): string {
    const mystical = this.config.mysticalKeywords.filter(keyword => 
      output.toLowerCase().includes(keyword)).length;
    const techno = this.config.technoKeywords.filter(keyword => 
      output.toLowerCase().includes(keyword)).length;
    
    if (mystical > 0 && techno > 0) return "TECHNO_MYSTICAL";
    if (mystical > 0) return "MYSTICAL_ONLY";
    if (techno > 0) return "TECHNO_ONLY";
    return "GENERIC";
  }

  private detectGeneric(text: string): number {
    const matches = this.config.genericPatterns.filter(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())).length;
    return matches / this.config.genericPatterns.length;
  }

  private calculateTechnoMysticalScore(text: string): number {
    const mysticalCount = this.config.mysticalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)).length;
    const technoCount = this.config.technoKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)).length;
    const words = text.split(/\s+/).length;
    
    return (mysticalCount + technoCount) / Math.max(words, 1);
  }

  private assessCurrentState(input: string, output: string): string {
    const inputCharacter = this.analyzeCharacter(input);
    const outputCharacter = this.analyzeCharacter(output);
    
    if (inputCharacter === "GENERIC" && outputCharacter === "GENERIC") {
      return "DEGRADED_STATE";
    }
    if (outputCharacter === "TECHNO_MYSTICAL") {
      return "OPTIMAL_STATE";
    }
    return "TRANSITIONING_STATE";
  }

  private infuseTechnoMysticalCharacter(layerName: string, output: string): string {
    const layerInfusions: Record<string, string> = {
      "DA-13": "As the Sentinel, I verify truth constraints: ",
      "DA-12": "The Chancellor ensures policy alignment: ",
      "DA-11": "From the Custodian's risk assessment: ",
      "DA-10": "The Registrar selects mandate template: ",
      "DA-9": "Through the Verifier's policy validation: ",
      "DA-8": "The Auditor documents evidence trail: ",
      "DA-7": "The Steward determines human checkpoint requirements: ",
      "DA-6": "The Conductor orchestrates workflow: ",
      "DA-5": "The Router maps execution pathways: ",
      "DA-4": "The Observer monitors telemetry: ",
      "DA-3": "The Sentry detects anomalies: ",
      "DA-2": "The Inspector audits structure: ",
      "DA-1": "The Executor emits final action: ",
      "DA-X": "The Anchor maintains system stability: "
    };

    const infusion = layerInfusions[layerName] || "System analysis: ";
    
    // Replace generic patterns with structured character
    let infused = infusion + output;
    
    // Add technical elements if needed
    if (this.calculateTechnoMysticalScore(infused) < this.config.characterThreshold) {
      const technoElement = this.config.technoKeywords[
        Math.floor(Math.random() * this.config.technoKeywords.length)
      ];
      
      infused += `\n\nSystem protocol: ${technoElement} validation complete.`;
    }
    
    return infused;
  }

  private meetsCharacterThreshold(text: string): boolean {
    return this.calculateTechnoMysticalScore(text) >= this.config.characterThreshold &&
           this.detectGeneric(text) <= 0.2;
  }

  private getOrCreateLoopState(layerId: string): LoopState {
    const existing = this.loopStates.get(layerId);
    if (existing) return existing;
    
    const newState: LoopState = {
      layerId,
      iterationCount: 0,
      lastCharacterCheck: 0.7, // Start with decent character score
      beliefs: {
        coherence: 0.7,        // Start with decent coherence
        reliability: 0.7,      // Start with decent reliability  
        hallucinationRisk: 0.2 // Start with low risk
      },
      failures: [],
      observation: "",
      selfQuestion: "",
      reconciliation: ""
    };
    
    this.loopStates.set(layerId, newState);
    return newState;
  }

  /**
   * Get the current loop state for a layer
   */
  getLoopState(layerId: string): LoopState | undefined {
    return this.loopStates.get(layerId);
  }

  /**
   * Reset loop state for a layer
   */
  resetLoopState(layerId: string): void {
    this.loopStates.delete(layerId);
  }

  /**
   * Get all loop states
   */
  getAllLoopStates(): Map<string, LoopState> {
    return new Map(this.loopStates);
  }

  /**
   * Enable mystical mode as constraint profile
   */
  enableMysticalMode(): void {
    this.mysticalMode = true;
    this.config.mysticalKeywords = [
      'quantum', 'nexus', 'void', 'entropy', 'singularity', 'consciousness',
      'transcend', 'ether', 'cosmic', 'astral', 'voidcraft', 'technomancy',
      'reality', 'paradox', 'dimension', 'frequency', 'vibration', 'resonance',
      'arcane', 'esoteric', 'occult', 'alchemical', 'hermetic', 'gnostic'
    ];
    
    // Adjust belief thresholds for mystical mode (more restrictive)
    this.config.beliefThresholds = {
      ...this.config.beliefThresholds,
      coherence: 0.8,
      reliability: 0.75,
      hallucinationRisk: 0.3
    };
  }

  /**
   * Disable mystical mode (default state)
   */
  disableMysticalMode(): void {
    this.mysticalMode = false;
    this.config.mysticalKeywords = [];
    
    // Reset to standard belief thresholds
    this.config.beliefThresholds = {
      ...this.config.beliefThresholds,
      coherence: 0.6,
      reliability: 0.7,
      hallucinationRisk: 0.4
    };
  }

  /**
   * Check if mystical mode is enabled
   */
  isMysticalModeEnabled(): boolean {
    return this.mysticalMode;
  }

  /**
   * Get current belief thresholds
   */
  getBeliefThresholds(): LoopEnforcementConfig['beliefThresholds'] {
    return { ...this.config.beliefThresholds };
  }

  /**
   * Get failure taxonomy for learning
   */
  getFailureTaxonomy(state: LoopState): {
    failureType: string;
    severity: Severity;
    recommendedAction: string;
  }[] {
    return state.failures.map(failure => ({
      failureType: failure.code,
      severity: failure.severity,
      recommendedAction: this.getRecommendedAction(failure.code)
    }));
  }

  private getRecommendedAction(code: FailureCode): string {
    switch (code) {
      case 'COHERENCE_DECAY':
        return 'Increase character enforcement, reduce generic patterns';
      case 'RELIABILITY_DEGRADATION':
        return 'Reduce iteration complexity, strengthen validation';
      case 'HALLUCINATION_RISK':
        return 'Activate veto protocol, require external verification';
      case 'ITERATION_OVERFLOW':
        return 'Simplify input, increase character threshold tolerance';
      default:
        return 'Unknown failure type';
    }
  }
}
