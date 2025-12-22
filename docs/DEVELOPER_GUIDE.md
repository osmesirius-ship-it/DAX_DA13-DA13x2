# DAX DA13-DA13x2 Developer Guide

## Overview

This guide provides comprehensive information for developers working with the DAX DA13-DA13x2 recursive governance system. It covers architecture, implementation details, integration patterns, and best practices.

## System Architecture

### Core Components

#### 1. MCP Server (`/mcp/`)
The Model Context Protocol server provides the primary interface for DAX governance functionality.

**Key Files:**
- `src/index.ts` - Main MCP server entry point
- `src/dax-core.ts` - Core governance engine
- `src/loop-enforcer.ts` - Recursive stability system
- `src/chat-interface.ts` - Chat functionality

#### 2. Configuration (`/config/`)
Layer configurations and system settings.

**Files:**
- `layers.json` - Basic layer configurations
- `agi-layers.json` - Advanced AGI-specific configurations

#### 3. SDKs (`/sdk/`)
Client libraries for different languages.

**Structure:**
- `javascript/` - Node.js and browser SDK
- `python/` - Python client library

#### 4. Documentation (`/docs/`)
Comprehensive documentation and guides.

## Development Setup

### Prerequisites
- Node.js 18+ 
- TypeScript 5.0+
- Python 3.8+ (for Python SDK)
- Git

### Environment Setup

1. **Clone Repository**
```bash
git clone https://github.com/osmesirius-ship-it/DAX_DA13-DA13x2.git
cd DAX_DA13-DA13x2
```

2. **Install Dependencies**
```bash
# MCP server dependencies
cd mcp && npm install

# Python SDK (optional)
cd ../sdk/python && pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your XAI_API_KEY
```

4. **Build System**
```bash
cd mcp && npm run build
```

## Core Implementation

### DAX Governance Core

The core governance engine processes inputs through 14 sequential layers:

```typescript
class DAXGovernanceCore {
  constructor(config: DAXConfig) {
    this.layers = this.initializeLayers(config);
    this.loopEnforcer = new LoopEnforcer(config.loopConfig);
  }

  async runGovernance(input: GovernanceInput): Promise<GovernanceResult> {
    let beliefState = this.initializeBeliefState();
    let governanceTrace: GovernanceTrace[] = [];
    
    // Loop enforcement for stability
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Process through all layers
      const layerResults = await this.processLayers(input, beliefState);
      
      // Update belief state
      beliefState = this.updateBeliefState(beliefState, layerResults);
      
      // Check convergence
      if (this.loopEnforcer.hasConverged(beliefState)) {
        break;
      }
    }
    
    return this.formatResult(beliefState, governanceTrace);
  }
}
```

### Layer Implementation Pattern

Each governance layer follows a consistent interface:

```typescript
interface GovernanceLayer {
  name: string;
  id: string;
  process(input: LayerInput, context: LayerContext): Promise<LayerOutput>;
  validate(config: LayerConfig): boolean;
}

class SentinelLayer implements GovernanceLayer {
  name = "Sentinel";
  id = "DA-13";
  
  async process(input: LayerInput, context: LayerContext): Promise<LayerOutput> {
    // Truth validation logic
    const truthScore = await this.validateTruth(input.text);
    const fabricationRisk = await this.detectFabrication(input.text);
    
    return {
      status: truthScore > this.threshold ? "success" : "failed",
      output: input.text,
      metadata: {
        truth_score: truthScore,
        fabrication_risk: fabricationRisk
      }
    };
  }
}
```

### Loop Enforcement System

The loop enforcer ensures system stability and prevents infinite loops:

```typescript
class LoopEnforcer {
  async enforceStability(
    beliefHistory: BeliefState[],
    governanceTrace: GovernanceTrace[]
  ): Promise<LoopResult> {
    // Check convergence
    const convergence = this.detectConvergence(beliefHistory);
    
    // Validate causal consistency
    const causalProof = this.validateCausalProof(governanceTrace);
    
    // Prevent infinite loops
    const shouldTerminate = this.shouldTerminate(beliefHistory);
    
    return {
      converged: convergence.converged,
      causal_valid: causalProof.valid,
      terminate: shouldTerminate,
      belief_state: beliefHistory[beliefHistory.length - 1]
    };
  }
}
```

## MCP Server Development

### Adding New Tools

To add a new tool to the MCP server:

1. **Define Tool Schema**
```typescript
const newTool = {
  name: 'tool_name',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: {
      parameter: { type: 'string', description: 'Parameter description' }
    },
    required: ['parameter']
  }
};
```

2. **Add to Tools List**
```typescript
// In src/index.ts, add to tools array
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // existing tools...
      newTool
    ]
  };
});
```

3. **Implement Handler**
```typescript
// In CallToolRequestSchema handler
case 'tool_name': {
  const result = await daxCore.newTool(args.parameter);
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  };
}
```

### Adding New Resources

1. **Define Resource**
```typescript
const newResource = {
  uri: 'dax://new/resource',
  name: 'Resource Name',
  description: 'Resource description',
  mimeType: 'application/json'
};
```

2. **Add to Resources List**
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      // existing resources...
      newResource
    ]
  };
});
```

3. **Implement Resource Handler**
```typescript
case 'dax://new/resource': {
  const data = await daxCore.getNewResource();
  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(data)
    }]
  };
}
```

## SDK Development

### JavaScript SDK

The JavaScript SDK provides a client interface for DAX functionality:

```typescript
export class DAXGovernance {
  constructor(config: DAXClientConfig) {
    this.client = new MCPClient(config);
  }

  async generateChat(input: ChatInput): Promise<ChatResponse> {
    return this.client.call('generate_chat', input);
  }

  async runGovernance(input: GovernanceInput): Promise<GovernanceResult> {
    return this.client.call('run_dax_governance', input);
  }

  async validateCompliance(input: ComplianceInput): Promise<ComplianceResult> {
    return this.client.call('validate_governance_compliance', input);
  }
}
```

### Python SDK

The Python SDK provides similar functionality:

```python
class DAXGovernance:
    def __init__(self, config: DAXConfig):
        self.client = MCPClient(config)
    
    async def generate_chat(self, message: str, **kwargs) -> ChatResponse:
        return await self.client.call('generate_chat', {
            'message': message,
            **kwargs
        })
    
    async def run_governance(self, input_text: str, **kwargs) -> GovernanceResult:
        return await self.client.call('run_dax_governance', {
            'input': input_text,
            **kwargs
        })
```

## Configuration Management

### Layer Configuration

Layers are configured through JSON files:

```json
{
  "layers": {
    "13": {
      "name": "Sentinel",
      "enabled": true,
      "threshold": 0.8,
      "config": {
        "truth_sources": ["verified_databases", "fact_check_apis"],
        "fabrication_detection": true,
        "strict_mode": false
      }
    }
  }
}
```

### Runtime Configuration

Configuration can be overridden at runtime:

```typescript
const result = await dax.runGovernance({
  input: "Your text",
  layerOverrides: {
    "13": { threshold: 0.9 },
    "11": { risk_threshold: 0.2 }
  }
});
```

## Testing

### Unit Tests

```typescript
describe('SentinelLayer', () => {
  it('should validate truth correctly', async () => {
    const layer = new SentinelLayer(defaultConfig);
    const result = await layer.process({
      text: "The sky is blue",
      context: {}
    });
    
    expect(result.status).toBe('success');
    expect(result.metadata.truth_score).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests

```typescript
describe('DAX Governance Integration', () => {
  it('should process input through all layers', async () => {
    const dax = new DAXGovernanceCore(testConfig);
    const result = await dax.runGovernance({
      input: "Test input",
      includeReasons: true
    });
    
    expect(result.trace).toHaveLength(14);
    expect(result.output).toBeDefined();
  });
});
```

### Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should complete within time limits', async () => {
    const start = Date.now();
    await dax.runGovernance({ input: "Test" });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 second limit
  });
});
```

## Error Handling

### Standard Error Types

```typescript
export class DAXError extends Error {
  constructor(
    message: string,
    public code: string,
    public layer?: string,
    public details?: any
  ) {
    super(message);
  }
}

export class ValidationError extends DAXError {
  constructor(message: string, layer: string, details: any) {
    super(message, 'VALIDATION_ERROR', layer, details);
  }
}

export class ConfigurationError extends DAXError {
  constructor(message: string, details: any) {
    super(message, 'CONFIGURATION_ERROR', undefined, details);
  }
}
```

### Error Recovery

```typescript
async function handleGovernanceError(error: DAXError): Promise<RecoveryResult> {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return await retryWithLowerThreshold(error.layer);
    case 'TIMEOUT_ERROR':
      return await fallbackToSimplerPolicy();
    case 'CONFIGURATION_ERROR':
      return await reloadConfiguration();
    default:
      throw error;
  }
}
```

## Performance Optimization

### Caching Strategies

```typescript
class GovernanceCache {
  private cache = new Map<string, CacheEntry>();
  
  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }
    return null;
  }
  
  async set(key: string, data: any, ttl: number): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}
```

### Parallel Processing

```typescript
async function processLayersParallel(
  input: LayerInput,
  parallelLayers: string[]
): Promise<LayerOutput[]> {
  const promises = parallelLayers.map(layerId => 
    this.processLayer(layerId, input)
  );
  
  return Promise.all(promises);
}
```

### Resource Management

```typescript
class ResourceManager {
  private connections = new Map<string, any>();
  
  async getConnection(name: string): Promise<any> {
    if (!this.connections.has(name)) {
      this.connections.set(name, await this.createConnection(name));
    }
    return this.connections.get(name);
  }
  
  async cleanup(): Promise<void> {
    for (const [name, conn] of this.connections) {
      await conn.close();
    }
    this.connections.clear();
  }
}
```

## Monitoring and Debugging

### Logging System

```typescript
class DAXLogger {
  constructor(private config: LogConfig) {}
  
  debug(message: string, metadata?: any): void {
    if (this.config.level === 'debug') {
      console.log(`[DEBUG] ${message}`, metadata);
    }
  }
  
  governanceTrace(trace: GovernanceTrace[]): void {
    if (this.config.includeGovernance) {
      console.log('[GOVERNANCE]', trace);
    }
  }
}
```

### Metrics Collection

```typescript
class MetricsCollector {
  private metrics = new Map<string, Metric>();
  
  recordTiming(operation: string, duration: number): void {
    const metric = this.metrics.get(operation) || { 
      type: 'timing', 
      values: [] 
    };
    metric.values.push(duration);
    this.metrics.set(operation, metric);
  }
  
  recordCounter(operation: string, increment: number = 1): void {
    const metric = this.metrics.get(operation) || { 
      type: 'counter', 
      value: 0 
    };
    metric.value += increment;
    this.metrics.set(operation, metric);
  }
}
```

### Health Checks

```typescript
class HealthChecker {
  async checkSystem(): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkLayers(),
      this.checkConfiguration(),
      this.checkResources(),
      this.checkLoopEnforcer()
    ]);
    
    return {
      healthy: checks.every(check => check.healthy),
      checks,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Deployment

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY mcp/package*.json ./
RUN npm ci --only=production

COPY mcp/dist ./dist
COPY config ../config

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dax-governance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dax-governance
  template:
    metadata:
      labels:
        app: dax-governance
    spec:
      containers:
      - name: dax
        image: dax-governance:latest
        ports:
        - containerPort: 3000
        env:
        - name: XAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: dax-secrets
              key: xai-api-key
```

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Write comprehensive tests
- Document public APIs

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

### Code Review Guidelines

- Review for security implications
- Check performance impact
- Verify error handling
- Ensure documentation is complete

## Troubleshooting

### Common Development Issues

1. **TypeScript Compilation Errors**
   - Check tsconfig.json configuration
   - Ensure all dependencies are installed
   - Verify import paths are correct

2. **MCP Server Connection Issues**
   - Verify environment variables
   - Check network connectivity
   - Review server logs

3. **Layer Configuration Problems**
   - Validate JSON syntax
   - Check configuration schema
   - Verify layer dependencies

### Debugging Tools

```typescript
// Enable debug mode
const dax = new DAXGovernanceCore({
  ...config,
  debug: true,
  logLevel: 'debug'
});

// Add breakpoints
if (process.env.NODE_ENV === 'development') {
  debugger;
}
```

## Best Practices

1. **Security First**
   - Validate all inputs
   - Sanitize outputs
   - Use secure communication

2. **Performance Awareness**
   - Monitor response times
   - Implement caching
   - Use connection pooling

3. **Reliability**
   - Handle errors gracefully
   - Implement retry logic
   - Provide fallback mechanisms

4. **Maintainability**
   - Write clear documentation
   - Use consistent patterns
   - Keep code modular

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## Architecture Details

See [GOVERNANCE_LAYERS.md](GOVERNANCE_LAYERS.md) and [LOOP_ENFORCER.md](LOOP_ENFORCER.md) for detailed architecture information.
