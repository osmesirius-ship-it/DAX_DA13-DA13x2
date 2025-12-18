# DAX MCP Server Installation

## Prerequisites

- Node.js 18+ and npm installed
- X.AI API key for DAX governance functionality

## Installation Steps

### 1. Quick Start (No Dependencies)
For immediate testing without any installation:
```bash
cd mcp
node src/index-simple-js.js
```

### 2. Full Installation
```bash
cd mcp
npm install
npm run build
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your XAI_API_KEY
```

### 4. Test the Server
```bash
# Simple JavaScript version (no dependencies needed)
node src/index-simple-js.js

# Full TypeScript version (requires npm install)
node dist/index.js
```

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dax-governance": {
      "command": "node",
      "args": ["/Users/user/projects/DAX_DA13-DA13x2/mcp/dist/index.js"],
      "env": {
        "XAI_API_KEY": "your_xai_api_key_here"
      }
    }
  }
}
```

## Troubleshooting

### TypeScript Compilation Errors
If you see TypeScript errors about missing modules:

1. **Install dependencies first**:
   ```bash
   npm install
   ```

2. **Check Node.js version**:
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

3. **Clean and rebuild**:
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

### Alternative: Simple Version
If dependency installation fails, use the simple version:
```bash
node src/index-simple.ts
```

This provides full MCP interface without external dependencies.

## Development

### Development Mode
```bash
npm run dev  # Watch mode with auto-rebuild
```

### Testing
```bash
npm test
```

## Architecture

The MCP server provides:
- **Tools**: Interactive governance operations
- **Resources**: Configuration and status data  
- **Prompts**: Pre-configured governance workflows

Both versions (full and simple) implement the same MCP protocol interface.
