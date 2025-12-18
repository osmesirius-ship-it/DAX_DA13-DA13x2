# DAX_DA13-DA13x2
DA-13 + DA-X Recursive Governance Core – the first working cognitive immune system for frontier AI models

## Quick Start

### MCP Server Integration
The project now includes a full Model Context Protocol (MCP) server for seamless integration with AI clients:

```bash
cd mcp
npm install
npm run build
cp .env.example .env  # Add your XAI API key
```

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