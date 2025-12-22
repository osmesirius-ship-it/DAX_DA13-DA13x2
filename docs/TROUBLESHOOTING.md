# DAX DA13-DA13x2 Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues with the DAX DA13-DA13x2 recursive governance system. Issues are categorized by component and severity.

## Quick Diagnosis

### System Health Check
```bash
# Check if MCP server is running
ps aux | grep "node.*dist/index.js"

# Check environment variables
env | grep DAX_

# Check configuration files
ls -la config/ && cat config/layers.json | jq .

# Test basic connectivity
curl -X POST http://localhost:3000/health
```

### Common Error Patterns
- **Timeout errors**: Usually performance or resource issues
- **Validation failures**: Configuration or input problems
- **Connection errors**: Network or authentication issues
- **Memory errors**: Resource exhaustion or memory leaks

## MCP Server Issues

### Server Won't Start

**Symptoms:**
- Server fails to start
- Immediate exit with error code
- No response on health endpoint

**Causes & Solutions:**

1. **Missing Environment Variables**
```bash
# Check required variables
echo $XAI_API_KEY
echo $XAI_MODEL

# Fix: Set missing variables
export XAI_API_KEY="your_key_here"
export XAI_MODEL="grok-4"
```

2. **Configuration File Issues**
```bash
# Check configuration syntax
cat config/layers.json | jq .

# Fix: Invalid JSON
npm run validate-config

# Fix: Missing configuration files
cp config/layers.json.example config/layers.json
```

3. **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000

# Fix: Kill existing process or change port
kill -9 <PID>
# or
export DAX_PORT=3001
```

4. **Dependencies Not Installed**
```bash
# Fix: Install dependencies
cd mcp && npm install

# Fix: Clean install
rm -rf node_modules package-lock.json
npm install
```

### Server Performance Issues

**Symptoms:**
- Slow response times (>5 seconds)
- High CPU/memory usage
- Request timeouts

**Causes & Solutions:**

1. **High Load**
```bash
# Check system resources
top -p $(pgrep -f "node.*dist/index.js")

# Fix: Scale horizontally
kubectl scale deployment dax-governance --replicas=5

# Fix: Optimize configuration
echo '{"performance_mode": "optimized"}' > config/performance.json
```

2. **Memory Leaks**
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep node'

# Fix: Restart server periodically
systemctl restart dax-governance

# Fix: Enable memory monitoring
export DAX_MEMORY_MONITORING=true
```

3. **Database Connection Issues**
```bash
# Check connection pool
curl http://localhost:3000/metrics | grep connection

# Fix: Increase pool size
export DAX_DB_POOL_SIZE=20

# Fix: Enable connection retry
export DAX_DB_RETRY=true
```

## Governance Layer Issues

### Layer Validation Failures

**Symptoms:**
- Requests fail at specific layers
- Governance trace shows layer errors
- Inconsistent validation results

**Diagnosis:**
```javascript
// Get detailed layer information
const layerInfo = await dax.getLayerConfig(['13', '12', '11']);
console.log(layerInfo);

// Test individual layer
const result = await dax.runGovernance({
  input: "test",
  layerOverrides: { "13": { debug: true } }
});
```

**Common Layer Issues:**

1. **DA-13 (Sentinel) - Truth Validation**
```json
{
  "error": "Truth validation failed",
  "solutions": [
    "Check knowledge base connectivity",
    "Verify truth source configuration",
    "Lower truth threshold temporarily"
  ]
}
```

2. **DA-11 (Custodian) - Risk Assessment**
```json
{
  "error": "Risk assessment timeout",
  "solutions": [
    "Check risk model files",
    "Verify domain configurations",
    "Increase timeout settings"
  ]
}
```

3. **DA-X (Anchor) - Loop Enforcement**
```json
{
  "error": "Convergence not achieved",
  "solutions": [
    "Lower convergence threshold",
    "Increase max iterations",
    "Check belief state initialization"
  ]
}
```

### Configuration Issues

**Symptoms:**
- Layers behave inconsistently
- Configuration changes don't take effect
- Validation errors in configuration

**Diagnosis:**
```bash
# Validate configuration
npm run validate-config

# Check specific layer config
cat config/layers.json | jq '.layers["13"]'

# Reload configuration
curl -X POST http://localhost:3000/reload-config
```

**Solutions:**
```json
{
  "configuration_fixes": {
    "invalid_thresholds": "Ensure thresholds are between 0 and 1",
    "missing_layers": "Add missing layer definitions",
    "syntax_errors": "Fix JSON syntax errors",
    "type_mismatches": "Ensure correct data types"
  }
}
```

## Chat Interface Issues

### Chat Session Problems

**Symptoms:**
- Sessions not persisting
- Context lost between messages
- Session creation failures

**Diagnosis:**
```javascript
// Check session status
const session = await dax.getChatSession('session-id');
console.log(session);

// Test session creation
const newSession = await dax.generateChat({
  message: "test",
  sessionId: "test-session"
});
```

**Solutions:**

1. **Session Store Issues**
```bash
# Check session store connectivity
curl http://localhost:3000/session-store/health

# Fix: Clear corrupted sessions
curl -X DELETE http://localhost:3000/sessions/clear-corrupted

# Fix: Rebuild session index
curl -X POST http://localhost:3000/sessions/rebuild-index
```

2. **Memory Issues**
```bash
# Check session memory usage
curl http://localhost:3000/metrics | grep session_memory

# Fix: Enable session cleanup
export DAX_SESSION_CLEANUP=true
export DAX_SESSION_TTL=3600
```

### Response Generation Issues

**Symptoms:**
- Empty or incomplete responses
- Malformed JSON responses
- Timeout during generation

**Diagnosis:**
```javascript
// Test with debugging
const response = await dax.generateChat({
  message: "test",
  includeGovernance: true,
  debug: true
});

// Check response structure
console.log(JSON.stringify(response, null, 2));
```

**Solutions:**
```json
{
  "response_issues": {
    "empty_responses": "Check model connectivity and API keys",
    "malformed_json": "Validate response serialization",
    "timeouts": "Increase response timeout or optimize layers"
  }
}
```

## Integration Issues

### Claude Desktop Integration

**Symptoms:**
- DAX tools not appearing in Claude
- Connection refused errors
- Authentication failures

**Diagnosis:**
```bash
# Check Claude configuration
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Test MCP connection
echo '{"jsonrpc": "2.0", "method": "tools/list"}' | node dist/index.js
```

**Solutions:**

1. **Configuration Errors**
```json
{
  "claude_config": {
    "correct_path": "/Users/user/projects/DAX_DA13-DA13x2/mcp/dist/index.js",
    "environment_variables": {
      "XAI_API_KEY": "must_be_set",
      "DAX_ENV": "development"
    },
    "permissions": "ensure_file_is_executable"
  }
}
```

2. **Path Issues**
```bash
# Fix: Use absolute paths
sed -i 's|/relative/path|/absolute/path|g' claude_desktop_config.json

# Fix: Check file exists and is executable
ls -la mcp/dist/index.js
chmod +x mcp/dist/index.js
```

### SDK Integration Issues

**JavaScript SDK:**
```javascript
// Common issues and fixes
const dax = new DAXGovernance({
  apiKey: process.env.XAI_API_KEY, // Must be set
  endpoint: 'http://localhost:3000', // Correct endpoint
  timeout: 30000 // Reasonable timeout
});

// Handle connection errors
dax.on('error', (error) => {
  console.error('DAX Error:', error);
  if (error.code === 'ECONNREFUSED') {
    // Server not running
  }
});
```

**Python SDK:**
```python
# Common issues and fixes
dax = DAXGovernance(
    api_key=os.getenv('XAI_API_KEY'),  # Must be set
    endpoint='http://localhost:3000',  # Correct endpoint
    timeout=30  # Reasonable timeout
)

# Handle exceptions
try:
    result = await dax.generate_chat("test")
except ConnectionError:
    print("Server not running")
except ValidationError as e:
    print(f"Validation failed: {e}")
```

## Performance Issues

### Slow Response Times

**Diagnosis:**
```bash
# Check response times
curl -w "@curl-format.txt" -X POST http://localhost:3000/governance

# Monitor layer performance
curl http://localhost:3000/metrics | grep layer_duration
```

**Optimization Strategies:**

1. **Layer Optimization**
```json
{
  "optimizations": {
    "parallel_processing": "Enable parallel layer execution",
    "caching": "Enable result caching",
    "threshold_tuning": "Optimize validation thresholds"
  }
}
```

2. **Resource Scaling**
```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable clustering
export DAX_CLUSTER_WORKERS=4

# Optimize garbage collection
export NODE_OPTIONS="--expose-gc"
```

### Memory Usage

**Diagnosis:**
```bash
# Monitor memory
ps aux | grep node | grep -v grep
top -p $(pgrep -f "node.*dist/index.js")

# Check for memory leaks
curl http://localhost:3000/metrics | grep memory
```

**Solutions:**
```bash
# Enable memory monitoring
export DAX_MEMORY_MONITORING=true

# Set memory limits
export DAX_MEMORY_LIMIT=2048

# Enable periodic cleanup
export DAX_CLEANUP_INTERVAL=300000
```

## Error Reference

### Error Codes

| Code | Description | Severity | Solution |
|------|-------------|----------|----------|
| E001 | Configuration file not found | High | Create missing config files |
| E002 | Invalid JSON in configuration | High | Fix JSON syntax |
| E003 | Missing environment variable | High | Set required env vars |
| E004 | Layer validation failed | Medium | Check layer configuration |
| E005 | API key invalid | High | Update XAI_API_KEY |
| E006 | Connection timeout | Medium | Increase timeout |
| E007 | Memory exhaustion | High | Scale resources |
| E008 | Loop not converging | Medium | Adjust thresholds |
| E009 | Session store error | Low | Restart session store |
| E010 | Database connection failed | High | Check DB connectivity |

### Error Response Format
```json
{
  "error": {
    "code": "E005",
    "message": "API key validation failed",
    "layer": "DA-13",
    "details": {
      "api_key_status": "invalid",
      "suggested_action": "Update XAI_API_KEY"
    },
    "timestamp": "2025-12-22T13:46:00.000Z"
  }
}
```

## Debugging Tools

### Enable Debug Mode
```bash
# Environment variables
export DAX_DEBUG=true
export DAX_LOG_LEVEL=debug
export DAX_TRACE_GOVERNANCE=true

# In code
const dax = new DAXGovernanceCore({
  debug: true,
  logLevel: 'debug',
  traceGovernance: true
});
```

### Debug Commands
```bash
# Test individual layers
npm run test-layer -- --layer=13 --input="test"

# Validate configuration
npm run validate-config

# Check system health
npm run health-check

# Run diagnostics
npm run diagnose
```

### Logging
```bash
# Enable detailed logging
export DAX_LOG_LEVEL=debug
export DAX_LOG_FILE=/var/log/dax/debug.log

# View logs in real-time
tail -f /var/log/dax/debug.log

# Filter logs by layer
grep "DA-13" /var/log/dax/debug.log
```

## Recovery Procedures

### Automatic Recovery
```bash
# Enable auto-recovery
export DAX_AUTO_RECOVERY=true
export DAX_RECOVERY_ATTEMPTS=3

# Configure recovery actions
export DAX_RECOVERY_ACTIONS="restart,reload_config,clear_cache"
```

### Manual Recovery

1. **Server Restart**
```bash
# Graceful restart
systemctl restart dax-governance

# Force restart
pkill -f "node.*dist/index.js" && npm start
```

2. **Configuration Reset**
```bash
# Backup current config
cp -r config config.backup

# Reset to defaults
cp config/layers.json.example config/layers.json

# Reload configuration
curl -X POST http://localhost:3000/reload-config
```

3. **Cache Clear**
```bash
# Clear all caches
curl -X DELETE http://localhost:3000/cache

# Clear specific cache
curl -X DELETE http://localhost:3000/cache/layer-results
```

## Preventive Measures

### Monitoring Setup
```bash
# Set up monitoring
export DAX_MONITORING_ENABLED=true
export DAX_METRICS_ENDPOINT=http://prometheus:9090

# Configure alerts
export DAX_ALERT_WEBHOOK=https://alerts.example.com/webhook
```

### Health Checks
```bash
# Automated health checks
*/5 * * * * /usr/local/bin/dax-health-check.sh

# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Backup Procedures
```bash
# Backup configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/

# Backup session data
pg_dump dax_sessions > sessions-backup-$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/dax"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR/$DATE
tar -czf $BACKUP_DIR/$DATE/config.tar.gz config/
```

## Getting Help

### Support Channels
1. **Documentation**: Check relevant docs first
2. **GitHub Issues**: Report bugs and feature requests
3. **Community Forum**: Get help from other users
4. **Debug Logs**: Provide detailed logs when reporting issues

### Information to Include
- Error messages and codes
- System configuration
- Steps to reproduce
- Debug logs
- System specifications

### Emergency Procedures
1. **System Down**: Use backup server
2. **Data Loss**: Restore from backups
3. **Security Issue**: Follow security response protocol
4. **Performance Crisis**: Enable emergency mode

## FAQ

**Q: Why are my requests taking so long?**
A: Check system resources, layer performance, and network connectivity.

**Q: Why do I get validation failures?**
A: Review configuration files, check input format, and verify layer thresholds.

**Q: How do I fix a corrupted session?**
A: Clear the session cache and restart the server.

**Q: What if the system won't start?**
A: Check environment variables, configuration files, and dependencies.

**Q: How do I debug layer issues?**
A: Enable debug mode and check individual layer logs.
