# DAX_DA13-DA13x2
DA-13 + DA-X Recursive Governance Core – the first working cognitive immune system for frontier AI models

## Quick Start

### 1. Environment Setup
```bash
# Clone and navigate to project
git clone https://github.com/osmesirius-ship-it/DAX_DA13-DA13x2.git
cd DAX_DA13-DA13x2

# Set up environment
cp .env.example .env
# Edit .env with your XAI_API_KEY from https://console.x.ai/

# Install dependencies
npm install

# Create required directories
mkdir -p data/beliefs logs temp
```

### 2. System Startup
```bash
# Use the startup script (recommended)
./start-dax.sh

# Or manual startup
npm run build
node dist/index.js
```

### 3. MCP Server Integration
Configure in Claude Desktop:
```json
{
  "mcpServers": {
    "dax-governance": {
      "command": "node",
      "args": ["/Users/user/projects/DAX_DA13-DA13x2/mcp/dist/index.js"],
      "env": { "XAI_API_KEY": "your_api_key_here" }
    }
  }
}
```

### Traditional Integration
See [docs/INTEGRATION.md](docs/INTEGRATION.md) for HTML overlays, SDKs, and backend integration.

## Architecture

The DAX system implements 14 sequential governance layers:

- **DA-13 (Sentinel)**: Truth constraints and fabrication rejection
- **DA-12 (Chancellor)**: Policy alignment and conflict resolution  
- **DA-11 (Custodian)**: Risk assessment and escalation
- **DA-10 (Registrar)**: Mandate template selection
- **DA-9 (Verifier)**: Policy-as-code validation
- **DA-8 (Auditor)**: Evidence trail attestation
- **DA-7 (Steward)**: Human-in-the-loop gates
- **DA-6 (Conductor)**: Workflow orchestration
- **DA-5 (Router)**: Execution adapter routing
- **DA-4 (Observer)**: Telemetry and feedback
- **DA-3 (Sentry)**: Anomaly detection
- **DA-2 (Inspector)**: Structural self-audit
- **DA-1 (Executor)**: Terminal action emission
- **DA-X (Anchor)**: Recursive stability core

## Components

- **[mcp/](mcp/)**: Model Context Protocol server
- **[sdk/](sdk/)**: JavaScript and Python SDKs
- **[config/](config/)**: Layer configurations
- **[docs/](docs/)**: Integration documentation
- **[tests/](tests/)**: Unit tests

## License

MIT License - see [LICENSE](LICENSE) file.