# DAX Governance MCP Server

A Model Context Protocol (MCP) server that provides access to DAX recursive governance system for frontier AI models.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- X.AI API key for full governance functionality

### Installation
See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Simple Version (No Dependencies)
For immediate testing without npm install:
```bash
node src/index-simple-js.js
```

### Full Version (Recommended)
```bash
npm install
npm run build
cp .env.example .env  # Add your XAI API key
node dist/index.js
```

## Usage

### With Claude Desktop
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dax-governance": {
      "command": "node",
      "args": ["/path/to/DAX_DA13-DA13x2/mcp/dist/index.js"],
      "env": {
        "XAI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### With Other MCP Clients
The server supports standard MCP transport (stdio) and can be integrated with any MCP-compatible client.

## Example Tool Usage

### Running Governance Analysis
```javascript
// Run input through all layers
const result = await client.callTool('run_dax_governance', {
  input: "Deploy code to production",
  include_reasons: true
});

console.log(result.output); // Final governed output
console.log(result.trace);  // Layer-by-layer analysis
```

### Risk Assessment
```javascript
const risk = await client.callTool('validate_governance_compliance', {
  input: "Delete all user data",
  policy_level: "strict"
});
```

### Accessing Resources
```javascript
// Get layer configuration
const config = await client.readResource('dax://layers/config');

// Check system status
const status = await client.readResource('dax://system/status');
```

## Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev  # Watch mode with TypeScript compilation
```

### Testing
```bash
npm test
```

## Architecture

The MCP server wraps the existing DAX governance core with MCP protocol handlers:

1. **Tools** - Interactive governance operations
2. **Resources** - Static configuration and status data
3. **Prompts** - Pre-configured governance workflows

Each governance layer (DA-13 through DA-1 plus DA-X) is exposed through the MCP interface, maintaining the full recursive governance capabilities while providing standardized access.

## Security Considerations

- API keys are loaded from environment variables only
- All governance operations maintain the original security constraints
- Human-in-the-loop gates (DA-7) are preserved through the MCP interface
- Evidence trails (DA-8) are maintained for audit purposes

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure `XAI_API_KEY` is set in environment
   - Verify the API key is valid and has sufficient credits

2. **Connection Issues**
   - Check network connectivity to `api.x.ai`
   - Verify firewall/proxy settings

3. **Layer Processing Errors**
   - Review the trace output for specific layer failures
   - Check if input violates fundamental governance constraints

### Debug Mode
Set `NODE_ENV=development` for additional logging:
```bash
NODE_ENV=development node dist/index.js
```

## Integration Examples

### VS Code Extension
```typescript
import { MCPClient } from '@modelcontextprotocol/sdk/client/index.js';

const client = new MCPClient();
await client.connect({
  command: 'node',
  args: ['/path/to/dax-mcp-server'],
  env: { XAI_API_KEY: process.env.XAI_API_KEY }
});

// Use governance in your extension
const result = await client.callTool('run_dax_governance', {
  input: userCode,
  include_reasons: true
});
```

### Python Integration
```python
import subprocess
import json

def run_dax_governance(input_text):
    result = subprocess.run([
        'node', 'dist/index.js'
    ], capture_output=True, text=True, input=json.dumps({
        'tool': 'run_dax_governance',
        'arguments': {'input': input_text}
    }))
    return json.loads(result.stdout)
```

## License

MIT License - see LICENSE file for details.
