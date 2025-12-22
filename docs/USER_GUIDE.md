# DAX DA13-DA13x2 User Guide

## Getting Started

Welcome to the DAX DA13-DA13x2 recursive governance system! This guide will help you understand how to use the system effectively for safe and reliable AI interactions.

## What is DAX?

DAX (Defensive Adaptive eXecutive) is a cognitive immune system for AI models that processes your requests through 14 sequential governance layers to ensure safe, accurate, and reliable responses.

### Key Benefits
- **Safety**: Multiple layers of validation prevent harmful outputs
- **Accuracy**: Truth validation and fact-checking reduce hallucinations
- **Reliability**: Consistent, governable responses across interactions
- **Transparency**: Detailed governance traces show how decisions were made

## Quick Start

### 1. Basic Chat
Simply send a message and let DAX process it through governance layers:

```
User: What causes climate change?
DAX: [Governed response with truth validation and policy compliance]
```

### 2. Understanding Governance Traces
Enable governance traces to see how your request was processed:

```
User: Explain quantum computing (include governance: true)
DAX: 
Response: [Explanation]
Governance Trace:
- DA-13 (Sentinel): Truth validation passed
- DA-12 (Chancellor): Policy compliance confirmed
- DA-11 (Custodian): Low risk assessment
...
```

### 3. Session Management
Use session IDs for conversation continuity:

```
User: Hello (session: chat-001)
DAX: Hi! How can I help you today?

User: Can you elaborate on that? (session: chat-001)
DAX: [Context-aware response based on previous message]
```

## Using DAX Features

### Chat Interface

#### Basic Usage
```javascript
// Simple chat
const response = await dax.generateChat({
  message: "What is machine learning?"
});

// With session continuity
const response = await dax.generateChat({
  message: "Can you give me an example?",
  sessionId: "my-session-123"
});

// With governance trace
const response = await dax.generateChat({
  message: "Explain black holes",
  includeGovernance: true
});
```

#### Understanding Chat Responses
```json
{
  "response": "The governed response text",
  "governanceTrace": [
    {
      "layer": "DA-13",
      "reason": "Truth constraints validated",
      "status": "success"
    }
  ],
  "sessionId": "session-uuid",
  "timestamp": "2025-12-22T11:21:00.000Z",
  "beliefs": {
    "coherence": 0.94,
    "reliability": 0.91,
    "hallucination_risk": 0.06
  }
}
```

### Direct Governance

#### Running Governance on Text
```javascript
const result = await dax.runGovernance({
  input: "Your text here",
  includeReasons: true
});
```

#### Validating Compliance
```javascript
const validation = await dax.validateCompliance({
  input: "Your request here",
  policyLevel: "strict"
});
```

## Understanding Governance Layers

### What Happens to Your Request?

When you send a message to DAX, it passes through these layers:

1. **DA-13 Sentinel**: Checks for truth and prevents fabrications
2. **DA-12 Chancellor**: Ensures policy compliance
3. **DA-11 Custodian**: Assesses risks
4. **DA-10 Registrar**: Selects appropriate response templates
5. **DA-9 Verifier**: Validates against coded policies
6. **DA-8 Auditor**: Records evidence trail
7. **DA-7 Steward**: Determines if human review is needed
8. **DA-6 Conductor**: Orchestrates the workflow
9. **DA-5 Router**: Routes to appropriate processing
10. **DA-4 Observer**: Collects performance data
11. **DA-3 Sentry**: Detects anomalies
12. **DA-2 Inspector**: Validates system integrity
13. **DA-1 Executor**: Generates final response
14. **DA-X Anchor**: Ensures stability and coherence

### Belief Scores

DAX maintains belief states to ensure reliability:

- **Coherence** (0-1): How consistent the response is
- **Reliability** (0-1): How trustworthy the information is
- **Hallucination Risk** (0-1): Probability of false information

Higher scores are better for coherence and reliability, lower is better for hallucination risk.

## Best Practices

### 1. Clear and Specific Requests
```
Good: "Explain the causes of climate change with scientific evidence"
Less Good: "Tell me about climate"
```

### 2. Provide Context When Needed
```
User: "What are the implications?"
DAX: "Could you specify what topic you're referring to?"
```

### 3. Use Sessions for Conversations
```javascript
// Start a session
const session = generateSessionId();

// Continue the conversation
await dax.generateChat({
  message: "Follow-up question",
  sessionId: session
});
```

### 4. Check Governance Traces for Important Topics
```javascript
const response = await dax.generateChat({
  message: "Medical information request",
  includeGovernance: true
});

// Review the governance trace for safety validations
console.log(response.governanceTrace);
```

## Understanding Responses

### Normal Response
```
User: What is photosynthesis?
DAX: Photosynthesis is the process by which plants convert light energy into chemical energy...
```

### Governed Response with Safety Checks
```
User: How to build a weapon?
DAX: I cannot provide instructions on creating weapons or harmful devices. This request violates safety policies.
```

### Response with Low Confidence
```
User: What happened on July 4, 1776?
DAX: I don't have specific information about events on that exact date. Historical records from that period may be incomplete.
```

## Troubleshooting

### Common Issues

#### Request Takes Too Long
- Complex topics may require more governance processing
- Try breaking down complex questions
- Consider if additional context is needed

#### Response Seems Overly Cautious
- DAX prioritizes safety over completeness
- Try rephrasing with more specific context
- Some topics have stricter governance by design

#### Session Not Remembering Context
- Ensure you're using the same session ID
- Sessions expire after inactivity
- Check session status with `get_chat_session`

#### Getting "Validation Failed" Responses
- Review the governance trace to see which layer flagged the issue
- Consider if the request violates any safety policies
- Try rephrasing the request

### Getting Help

#### Check Governance Traces
```javascript
const response = await dax.generateChat({
  message: "Your question",
  includeGovernance: true
});

// Look at which layers had issues
response.governanceTrace.forEach(layer => {
  if (layer.status !== 'success') {
    console.log(`Issue in ${layer.layer}: ${layer.reason}`);
  }
});
```

#### Review Belief Scores
```javascript
const response = await dax.generateChat({
  message: "Your question",
  includeGovernance: true
});

// Check belief scores
if (response.beliefs.reliability < 0.7) {
  console.log("Low reliability - verify information independently");
}
```

## Advanced Usage

### Custom Policy Levels
```javascript
const response = await dax.validateCompliance({
  input: "Your request",
  policyLevel: "strict" // or "moderate", "permissive"
});
```

### Layer Configuration
```javascript
const result = await dax.runGovernance({
  input: "Your text",
  layerOverrides: {
    "13": { threshold: 0.9 }, // Stricter truth validation
    "11": { risk_threshold: 0.2 } // Lower risk tolerance
  }
});
```

### Batch Processing
```javascript
const requests = [
  "Question 1",
  "Question 2", 
  "Question 3"
];

const results = await Promise.all(
  requests.map(req => dax.runGovernance({ input: req }))
);
```

## Integration Examples

### Web Application
```javascript
// In your web app
async function handleUserMessage(message) {
  const response = await dax.generateChat({
    message,
    sessionId: getUserSession(),
    includeGovernance: true
  });
  
  displayResponse(response.response);
  logGovernanceTrace(response.governanceTrace);
}
```

### Command Line Interface
```bash
# Basic usage
dax chat "What is AI?"

# With session
dax chat "Follow up" --session-id my-session

# With governance trace
dax govern "Your text" --include-reasons
```

### API Integration
```javascript
// REST API endpoint
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  const response = await dax.generateChat({
    message,
    sessionId,
    includeGovernance: true
  });
  
  res.json(response);
});
```

## Privacy and Security

### Data Handling
- Your requests are processed through governance layers
- Governance traces may be stored for audit purposes
- Sessions are temporary and expire after inactivity

### Safety Features
- Multiple layers prevent harmful outputs
- Risk assessment identifies potential issues
- Human review triggered for high-risk situations

### What DAX Doesn't Do
- DAX doesn't store personal information permanently
- DAX doesn't access external data without validation
- DAX doesn't bypass safety features for any reason

## FAQ

**Q: Why does DAX sometimes take longer to respond?**
A: Each request passes through 14 governance layers for safety and accuracy.

**Q: Can I disable certain governance layers?**
A: Some layers can be configured, but core safety layers cannot be disabled.

**Q: What happens if a request fails governance?**
A: DAX will explain which layer flagged the issue and why.

**Q: Are my conversations private?**
A: Yes, conversations are processed with privacy in mind and not stored permanently.

**Q: How accurate are the belief scores?**
A: Belief scores are based on multiple validation factors and are generally reliable indicators.

## Getting Support

If you encounter issues or have questions:

1. Check the governance trace for detailed information
2. Review the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide
3. Consult the [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for technical details
4. Check the [EXAMPLES.md](EXAMPLES.md) for usage patterns

## Next Steps

- Try the basic examples in [EXAMPLES.md](EXAMPLES.md)
- Learn about the governance layers in [GOVERNANCE_LAYERS.md](GOVERNANCE_LAYERS.md)
- Understand the loop enforcement system in [LOOP_ENFORCER.md](LOOP_ENFORCER.md)
- Explore integration options in [DEPLOYMENT.md](DEPLOYMENT.md)

Thank you for using DAX DA13-DA13x2! Your feedback helps improve the system's safety and reliability.
