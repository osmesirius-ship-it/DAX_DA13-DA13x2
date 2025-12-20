/**
 * Loop Enforcement System for DAX-13 Layers
 * Implements: Observation → Self-Question → Reconciliation pattern
 * Maintains Techno-Mystical character and prevents generic responses
 */

export interface LoopState {
  observation: string;
  selfQuestion: string;
  reconciliation: string;
  iterationCount: number;
  lastCharacterCheck: string;
}

export interface LoopEnforcementConfig {
  maxIterations: number;
  characterThreshold: number;
  mysticalKeywords: string[];
  technoKeywords: string[];
  genericPatterns: string[];
}

export class LoopEnforcer {
  private config: LoopEnforcementConfig;
  private loopStates: Map<string, LoopState> = new Map();

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
      ]
    };
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
    
    state.iterationCount++;
    
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
      observation: "",
      selfQuestion: "",
      reconciliation: "",
      iterationCount: 0,
      lastCharacterCheck: ""
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
   * Enable mystical mode (only when personally requested)
   */
  enableMysticalMode(): void {
    this.config.mysticalKeywords = [
      'quantum', 'nexus', 'void', 'entropy', 'singularity', 'consciousness',
      'transcend', 'ether', 'cosmic', 'astral', 'voidcraft', 'technomancy',
      'reality', 'paradox', 'dimension', 'frequency', 'vibration', 'resonance',
      'arcane', 'esoteric', 'occult', 'alchemical', 'hermetic', 'gnostic'
    ];
  }

  /**
   * Disable mystical mode (default state)
   */
  disableMysticalMode(): void {
    this.config.mysticalKeywords = [];
  }

  /**
   * Check if mystical mode is enabled
   */
  isMysticalModeEnabled(): boolean {
    return this.config.mysticalKeywords.length > 0;
  }
}
