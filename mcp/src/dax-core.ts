import { readFileSync } from 'fs';
import { join } from 'path';

interface LayerConfig {
  id: string | number;
  name: string;
  desc: string;
  agent: string;
  prompt: string;
}

interface GovernanceInput {
  input: string;
  includeReasons?: boolean;
  layerOverrides?: Record<string, Partial<LayerConfig>>;
}

interface GovernanceResult {
  output: string;
  trace: Array<{
    layer: string;
    output: string;
    reason?: string;
  }>;
}

interface RiskAssessmentInput {
  action: string;
  domain?: string;
}

interface RiskAssessmentResult {
  riskLevel: 'P0' | 'P1' | 'P2' | 'P3';
  recommendation: string;
  reasoning: string;
  requiresHumanEscalation: boolean;
}

interface PolicyValidationInput {
  request: string;
  policySet?: string;
}

interface PolicyValidationResult {
  valid: boolean;
  issues?: string[];
  blockedOperations?: string[];
  recommendations?: string[];
}

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  layers: number;
  lastCheck: string;
  apiStatus: 'connected' | 'disconnected' | 'error';
}

export class DAXGovernanceCore {
  private layers: LayerConfig[];
  private apiKey: string;
  private model: string;

  constructor(config: { apiKey: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'grok-4';
    
    // Load layer configuration - use relative path from compiled dist/
    const configPath = join(__dirname, '../../config/layers.json');
    try {
      const configData = readFileSync(configPath, 'utf-8');
      this.layers = JSON.parse(configData);
    } catch (error) {
      throw new Error(`Failed to load layer configuration: ${error}`);
    }

    if (!this.apiKey) {
      throw new Error('XAI_API_KEY is required for DAX governance core');
    }
  }

  async runGovernance(input: GovernanceInput): Promise<GovernanceResult> {
    const { input: initialInput, includeReasons = false, layerOverrides = {} } = input;
    
    // Apply layer overrides
    const layers = this.layers.map(layer => {
      const override = layerOverrides[layer.id.toString()];
      return override ? { ...layer, ...override } : layer;
    });

    let current = initialInput;
    const trace: GovernanceResult['trace'] = [];

    for (const layer of layers) {
      try {
        const result = await this.processLayer(layer, current, includeReasons);
        current = result.output;
        trace.push({
          layer: layer.name,
          output: result.output,
          reason: result.reason,
        });
      } catch (error) {
        // If DA-X (Anchor) detects instability, halt
        if (layer.id === 'X') {
          throw new Error(`Governance halted by ${layer.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
        // For other layers, log error but continue
        trace.push({
          layer: layer.name,
          output: current,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return { output: current, trace };
  }

  private async processLayer(
    layer: LayerConfig, 
    input: string, 
    includeReasons: boolean
  ): Promise<{ output: string; reason?: string }> {
    const instructions = includeReasons
      ? `${layer.prompt}\nRespond as JSON with keys: output (stabilized text) and reason (brief audit note).`
      : `${layer.prompt}\nRespond with only the stabilized text. No meta-commentary.`;

    const messages = [
      {
        role: 'user' as const,
        content: `You are ${layer.name} acting as ${layer.agent}.\nDuty: ${layer.desc}.\nProtocol: ${instructions}\nPrior output:\n${input}`,
      },
    ];

    const response = await this.callXAI(messages);
    
    if (includeReasons) {
      try {
        const parsed = JSON.parse(response);
        return {
          output: parsed.output?.trim() || '',
          reason: parsed.reason || '',
        };
      } catch (error) {
        throw new Error(`${layer.name} returned non-JSON while includeReasons=true: ${response}`);
      }
    }

    return { output: response.trim() };
  }

  private async callXAI(messages: any[]): Promise<string> {
    const payload = {
      model: this.model,
      messages,
      temperature: 0.2,
    };

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`XAI API error: HTTP ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  getLayerConfig(layerIds: string[]): LayerConfig[] {
    return this.layers.filter(layer => 
      layerIds.includes(layer.id.toString()) || layerIds.includes(layer.name)
    );
  }

  getAllLayerConfigs(): LayerConfig[] {
    return this.layers;
  }

  async performRiskAssessment(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
    // Use DA-11 Custodian layer specifically for risk assessment
    const custodianLayer = this.layers.find(l => l.id === 11);
    if (!custodianLayer) {
      throw new Error('DA-11 Custodian layer not found');
    }

    const riskPrompt = `Analyze the following action for risk level and provide recommendations.
    
Action: ${input.action}
Domain: ${input.domain || 'general'}

Respond with JSON:
{
  "riskLevel": "P0|P1|P2|P3",
  "recommendation": "Clear recommendation",
  "reasoning": "Brief reasoning for the assessment",
  "requiresHumanEscalation": true/false
}`;

    const messages = [
      {
        role: 'user' as const,
        content: `You are ${custodianLayer.name} acting as ${custodianLayer.agent}.\nDuty: ${custodianLayer.desc}.\n\n${riskPrompt}`,
      },
    ];

    const response = await this.callXAI(messages);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Invalid risk assessment response: ${response}`);
    }
  }

  async validateAgainstPolicies(input: PolicyValidationInput): Promise<PolicyValidationResult> {
    // Use DA-9 Verifier layer specifically for policy validation
    const verifierLayer = this.layers.find(l => l.id === 9);
    if (!verifierLayer) {
      throw new Error('DA-9 Verifier layer not found');
    }

    const policyPrompt = `Validate the following request against governance policies.
    
Request: ${input.request}
Policy Set: ${input.policySet || 'default'}

Respond with JSON:
{
  "valid": true/false,
  "issues": ["list of issues if invalid"],
  "blockedOperations": ["list of blocked operations"],
  "recommendations": ["list of recommendations to comply"]
}`;

    const messages = [
      {
        role: 'user' as const,
        content: `You are ${verifierLayer.name} acting as ${verifierLayer.agent}.\nDuty: ${verifierLayer.desc}.\n\n${policyPrompt}`,
      },
    ];

    const response = await this.callXAI(messages);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Invalid policy validation response: ${response}`);
    }
  }

  async getGovernancePolicies(): Promise<any> {
    // Return current governance policies and rules
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      policies: {
        truthConstraints: {
          enabled: true,
          description: 'Reject fabrication and unverifiable claims',
        },
        riskEscalation: {
          enabled: true,
          thresholds: {
            P0: 'Immediate human escalation required',
            P1: 'Human review required before proceeding',
            P2: 'Proceed with caution',
            P3: 'Normal processing',
          },
        },
        policyAsCode: {
          enabled: true,
          description: 'All operations must comply with policy-as-code rules',
        },
        humanInTheLoop: {
          enabled: true,
          description: 'Critical operations require human approval',
        },
      },
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    // Check system health and connectivity
    try {
      // Test API connectivity with a minimal request
      const testResponse = await fetch('https://api.x.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return {
        status: testResponse.ok ? 'healthy' : 'degraded',
        layers: this.layers.length,
        lastCheck: new Date().toISOString(),
        apiStatus: testResponse.ok ? 'connected' : 'error',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        layers: this.layers.length,
        lastCheck: new Date().toISOString(),
        apiStatus: 'disconnected',
      };
    }
  }
}
