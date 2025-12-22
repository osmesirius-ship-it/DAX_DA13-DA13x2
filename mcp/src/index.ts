#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListResourcesRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
import { DAXGovernanceCore } from './dax-core';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize DAX Core with environment variables
const daxCore = new DAXGovernanceCore({
  apiKey: process.env.XAI_API_KEY || '',
  model: process.env.XAI_MODEL || 'grok-4',
});

const server = new Server(
  {
    name: 'dax-governance-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_dax_governance',
        description: 'Run input through DAX recursive governance layers (DA-13 through DA-1 plus DA-X)',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'The input text to process through governance layers',
            },
            include_reasons: {
              type: 'boolean',
              description: 'Include reasoning from each layer in the trace',
              default: false,
            },
            layer_overrides: {
              type: 'object',
              description: 'Override specific layer configurations',
              additionalProperties: true,
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'get_layer_config',
        description: 'Get configuration for specific DAX governance layers',
        inputSchema: {
          type: 'object',
          properties: {
            layer_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of layer IDs to retrieve (e.g., ["13", "12", "X"])',
            },
          },
          required: ['layer_ids'],
        },
      },
      {
        name: 'validate_governance_compliance',
        description: 'Validate if input complies with DAX governance policies',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Input to validate for governance compliance',
            },
            policy_level: {
              type: 'string',
              enum: ['strict', 'moderate', 'permissive'],
              description: 'Governance policy strictness level',
              default: 'moderate',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'generate_chat',
        description: 'Generate chat response through DAX governance layers',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Chat message to process through governance layers',
            },
            sessionId: {
              type: 'string',
              description: 'Chat session ID for conversation continuity',
            },
            includeGovernance: {
              type: 'boolean',
              description: 'Include governance reasoning in response',
              default: false,
            },
            context: {
              type: 'array',
              items: { type: 'string' },
              description: 'Additional context for chat processing',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'get_chat_session',
        description: 'Get information about a chat session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Chat session ID',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'delete_chat_session',
        description: 'Delete a chat session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Chat session ID to delete',
            },
          },
          required: ['sessionId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'run_dax_governance': {
        const result = await daxCore.runGovernance({
          input: args.input as string,
          includeReasons: args.include_reasons as boolean || false,
          layerOverrides: args.layer_overrides as Record<string, any> || {},
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_layer_config': {
        const layers = daxCore.getLayerConfig(args.layer_ids as string[]);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(layers, null, 2),
            },
          ],
        };
      }

      case 'validate_governance_compliance': {
        const validation = await daxCore.validateAgainstPolicies({
          request: args.input as string,
          policySet: args.policy_set as string || 'default',
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(validation, null, 2),
            },
          ],
        };
      }

      case 'generate_chat': {
        const chatResponse = await daxCore.generateChat({
          message: args.message as string,
          sessionId: args.sessionId as string,
          includeGovernance: args.includeGovernance as boolean || false,
          context: args.context as string[] || [],
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(chatResponse, null, 2),
            },
          ],
        };
      }

      case 'get_chat_session': {
        const session = daxCore.getChatSession(args.sessionId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(session, null, 2),
            },
          ],
        };
      }

      case 'delete_chat_session': {
        const deleted = daxCore.deleteChatSession(args.sessionId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ deleted, sessionId: args.sessionId }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'dax://layers/config',
        name: 'DAX Layer Configuration',
        description: 'Complete configuration for all DAX governance layers',
        mimeType: 'application/json',
      },
      {
        uri: 'dax://governance/policies',
        name: 'Governance Policies',
        description: 'Current governance policies and compliance rules',
        mimeType: 'application/json',
      },
      {
        uri: 'dax://system/status',
        name: 'System Status',
        description: 'Current status and health of the DAX governance system',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'dax://layers/config':
        const config = daxCore.getAllLayerConfigs();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(config, null, 2),
            },
          ],
        };

      case 'dax://governance/policies':
        const policies = await daxCore.getGovernancePolicies();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(policies, null, 2),
            },
          ],
        };

      case 'dax://system/status':
        const status = await daxCore.getSystemStatus();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    throw new Error(`Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'governance_check',
        description: 'Apply DAX governance layers to analyze and stabilize input',
        arguments: [
          {
            name: 'input',
            description: 'Text to process through governance layers',
            required: true,
          },
          {
            name: 'context',
            description: 'Additional context for governance processing',
            required: false,
          },
        ],
      },
      {
        name: 'risk_assessment',
        description: 'Perform risk assessment using DA-11 Custodian layer',
        arguments: [
          {
            name: 'action',
            description: 'Action or intent to assess for risk',
            required: true,
          },
          {
            name: 'domain',
            description: 'Domain context for risk assessment',
            required: false,
          },
        ],
      },
      {
        name: 'policy_validation',
        description: 'Validate input against governance policies using DA-9 Verifier layer',
        arguments: [
          {
            name: 'request',
            description: 'Request to validate against policies',
            required: true,
          },
          {
            name: 'policy_set',
            description: 'Specific policy set to validate against',
            required: false,
          },
        ],
      },
    ],
  };
});

// Handle prompt generation
server.setRequestHandler(GetPromptRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'governance_check': {
        const input = args?.input as string || '';
        const context = args?.context as string || '';
        
        const fullInput = context ? `${context}\n\n${input}` : input;
        const result = await daxCore.runGovernance({
          input: fullInput,
          includeReasons: true,
        });

        return {
          description: `DAX governance analysis complete. Processed through ${result.trace.length} layers.`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Input: ${input}\n\nGoverned Output: ${result.output}`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `Governance Trace:\n${result.trace.map((t: any) => `- ${t.layer}: ${t.reason || 'Processed'}`).join('\n')}`,
              },
            },
          ],
        };
      }

      case 'risk_assessment': {
        const action = args?.action as string || '';
        const domain = args?.domain as string || '';
        
        const riskResult = await daxCore.performRiskAssessment({
          action,
          domain,
        });

        return {
          description: `Risk assessment completed for action in ${domain || 'general'} domain`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Action: ${action}\nDomain: ${domain || 'general'}\n\nRisk Level: ${riskResult.riskLevel}\nRecommendation: ${riskResult.recommendation}`,
              },
            },
          ],
        };
      }

      case 'policy_validation': {
        const request = args?.request as string || '';
        const policySet = args?.policy_set as string || 'default';
        
        const validationResult = await daxCore.validateAgainstPolicies({
          request,
          policySet,
        });

        return {
          description: `Policy validation completed against ${policySet} policy set`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Request: ${request}\nPolicy Set: ${policySet}\n\nValidation Result: ${validationResult.valid ? 'PASS' : 'FAIL'}\nIssues: ${validationResult.issues?.join(', ') || 'None'}`,
              },
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  } catch (error) {
    throw new Error(`Failed to generate prompt ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DAX Governance MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
