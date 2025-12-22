# DAX DA13-DA13x2 API Documentation

## Overview

The DAX DA13-DA13x2 system provides a comprehensive API for recursive governance through the Model Context Protocol (MCP). This document details all available endpoints, tools, and integration methods.

## MCP Server Tools

### Core Governance Tools

#### `run_dax_governance`
Run input through DAX recursive governance layers (DA-13 through DA-1 plus DA-X).

**Parameters:**
- `input` (string, required): The input text to process through governance layers
- `include_reasons` (boolean, optional): Include reasoning from each layer in the trace
- `layer_overrides` (object, optional): Override specific layer configurations

**Response:**
```json
{
  "output": "Governed response text",
  "trace": [
    {
      "layer": "DA-13",
      "reason": "Truth constraint validation passed",
      "status": "success"
    }
  ],
  "beliefs": {
    "coherence": 0.95,
    "reliability": 0.88,
    "hallucination_risk": 0.12
  }
}
```

#### `get_layer_config`
Get configuration for specific DAX governance layers.

**Parameters:**
- `layer_ids` (array, required): Array of layer IDs to retrieve (e.g., ["13", "12", "X"])

**Response:**
```json
{
  "13": {
    "name": "Sentinel",
    "description": "Truth constraints and fabrication rejection",
    "enabled": true,
    "threshold": 0.8
  }
}
```

#### `validate_governance_compliance`
Validate if input complies with DAX governance policies.

**Parameters:**
- `input` (string, required): Input to validate for governance compliance
- `policy_level` (string, optional): Governance policy strictness level ("strict", "moderate", "permissive")

**Response:**
```json
{
  "valid": true,
  "compliance_score": 0.92,
  "violations": [],
  "warnings": ["Consider adding more context"]
}
```

### Chat Interface Tools

#### `generate_chat`
Generate chat response through DAX governance layers.

**Parameters:**
- `message` (string, required): Chat message to process through governance layers
- `sessionId` (string, optional): Chat session ID for conversation continuity
- `includeGovernance` (boolean, optional): Include governance reasoning in response
- `context` (array, optional): Additional context for chat processing

**Response:**
```json
{
  "response": "Governed chat response",
  "governanceTrace": [...],
  "sessionId": "uuid-string",
  "timestamp": "2025-12-22T11:07:00.000Z",
  "beliefs": {...}
}
```

#### `get_chat_session`
Get information about a chat session.

**Parameters:**
- `sessionId` (string, required): Chat session ID

**Response:**
```json
{
  "sessionId": "uuid-string",
  "createdAt": "2025-12-22T11:07:00.000Z",
  "messageCount": 5,
  "lastActivity": "2025-12-22T11:10:00.000Z",
  "messages": [...]
}
```

#### `delete_chat_session`
Delete a chat session.

**Parameters:**
- `sessionId` (string, required): Chat session ID to delete

**Response:**
```json
{
  "deleted": true,
  "sessionId": "uuid-string"
}
```

## MCP Server Resources

### `dax://layers/config`
Complete configuration for all DAX governance layers.

**Response:** JSON object containing all layer configurations, thresholds, and settings.

### `dax://governance/policies`
Current governance policies and compliance rules.

**Response:** JSON object containing policy definitions, rules, and compliance criteria.

### `dax://system/status`
Current status and health of the DAX governance system.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "active_sessions": 3,
  "total_requests": 127,
  "error_rate": 0.01,
  "average_response_time": 250
}
```

## MCP Server Prompts

### `governance_check`
Apply DAX governance layers to analyze and stabilize input.

**Parameters:**
- `input` (required): Text to process through governance layers
- `context` (optional): Additional context for governance processing

### `risk_assessment`
Perform risk assessment using DA-11 Custodian layer.

**Parameters:**
- `action` (required): Action or intent to assess for risk
- `domain` (optional): Domain context for risk assessment

### `policy_validation`
Validate input against governance policies using DA-9 Verifier layer.

**Parameters:**
- `request` (required): Request to validate against policies
- `policy_set` (optional): Specific policy set to validate against

## SDK Integration

### JavaScript SDK

```javascript
import { DAXGovernance } from '@dax/sdk';

const dax = new DAXGovernance({
  apiKey: process.env.XAI_API_KEY,
  model: 'grok-4',
  endpoint: 'http://localhost:3000'
});

// Run governance
const result = await dax.runGovernance({
  input: "Your request here",
  includeReasons: true
});

// Generate chat
const chat = await dax.generateChat({
  message: "Hello, how can you help?",
  sessionId: "session-123"
});
```

### Python SDK

```python
from dax_sdk import DAXGovernance

dax = DAXGovernance(
    api_key=os.getenv('XAI_API_KEY'),
    model='grok-4',
    endpoint='http://localhost:3000'
)

# Run governance
result = dax.run_governance(
    input="Your request here",
    include_reasons=True
)

# Generate chat
chat = dax.generate_chat(
    message="Hello, how can you help?",
    session_id="session-123"
)
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input failed governance validation",
    "details": {
      "layer": "DA-13",
      "reason": "Potential fabrication detected",
      "confidence": 0.87
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input failed governance validation
- `CONFIGURATION_ERROR`: Invalid layer configuration
- `API_KEY_ERROR`: Invalid or missing X.AI API key
- `RATE_LIMIT_ERROR`: Too many requests
- `SYSTEM_ERROR`: Internal system error

## Rate Limits

- **Standard**: 100 requests per minute
- **Premium**: 1000 requests per minute
- **Enterprise**: Custom limits

## Authentication

### API Key Authentication
Set `XAI_API_KEY` environment variable or pass in configuration:

```javascript
const dax = new DAXGovernance({
  apiKey: 'your-xai-api-key'
});
```

### Session Authentication
For chat sessions, use session IDs for continuity:

```javascript
const chat = await dax.generateChat({
  message: "Follow-up question",
  sessionId: "existing-session-id"
});
```

## Configuration

### Environment Variables
```bash
XAI_API_KEY=your_api_key_here
XAI_MODEL=grok-4
DAX_ENV=development
LOG_LEVEL=debug
CONFIG_PATH=/path/to/config
BELIEFS_PATH=/path/to/beliefs
```

### Layer Configuration
Override specific layer behaviors:

```javascript
const result = await dax.runGovernance({
  input: "Your request",
  layerOverrides: {
    "13": { threshold: 0.9 },
    "11": { risk_level: "high" }
  }
});
```

## WebSocket Support

For real-time chat and streaming:

```javascript
const ws = new DAXWebSocket('ws://localhost:3000/ws');

ws.on('governance_update', (data) => {
  console.log('Layer update:', data);
});

ws.send({
  type: 'chat',
  message: "Real-time message"
});
```

## Monitoring & Metrics

### Health Check Endpoint
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "memory_usage": 0.65,
  "active_sessions": 3
}
```

### Metrics Endpoint
```
GET /metrics
```

**Response:**
```json
{
  "requests_total": 1000,
  "requests_per_second": 15.5,
  "average_response_time": 250,
  "error_rate": 0.01,
  "layer_performance": {
    "13": { avg_time: 45, success_rate: 0.99 },
    "12": { avg_time: 38, success_rate: 0.98 }
  }
}
```

## Integration Examples

### Claude Desktop Integration
```json
{
  "mcpServers": {
    "dax-governance": {
      "command": "node",
      "args": ["/path/to/mcp/dist/index.js"],
      "env": { "XAI_API_KEY": "your_api_key" }
    }
  }
}
```

### Web Application Integration
```javascript
// Express.js middleware
app.use('/dax', daxMiddleware({
  apiKey: process.env.XAI_API_KEY,
  validateAll: true
}));

app.post('/api/chat', async (req, res) => {
  const result = await req.dax.generateChat(req.body);
  res.json(result);
});
```

### CLI Integration
```bash
# Direct CLI usage
dax govern "Your input here" --include-reasons

# Chat mode
dax chat --session-id my-session

# Configuration check
dax config --validate
```

## Best Practices

1. **Always include session IDs** for chat continuity
2. **Use includeReasons** during development for debugging
3. **Monitor belief scores** for system health
4. **Implement retry logic** for transient failures
5. **Cache layer configurations** for performance
6. **Log governance traces** for audit trails

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.
