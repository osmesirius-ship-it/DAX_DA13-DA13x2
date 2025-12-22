# DAX DA13-DA13x2 Examples

## Overview

This document provides comprehensive examples for using the DAX DA13-DA13x2 recursive governance system. Examples range from basic usage to advanced integration patterns.

## Quick Start Examples

### Basic Chat

```javascript
// Simple chat interaction
const { DAXGovernance } = require('@dax/sdk');

const dax = new DAXGovernance({
  apiKey: process.env.XAI_API_KEY,
  endpoint: 'http://localhost:3000'
});

async function basicChat() {
  const response = await dax.generateChat({
    message: "What is artificial intelligence?"
  });
  
  console.log(response.response);
  console.log('Belief scores:', response.beliefs);
}

basicChat();
```

```python
# Python equivalent
from dax_sdk import DAXGovernance
import os

dax = DAXGovernance(
    api_key=os.getenv('XAI_API_KEY'),
    endpoint='http://localhost:3000'
)

async def basic_chat():
    response = await dax.generate_chat(
        message="What is artificial intelligence?"
    )
    
    print(response.response)
    print("Belief scores:", response.beliefs)

# Run the example
import asyncio
asyncio.run(basic_chat())
```

### Governance with Trace

```javascript
async function governedResponse() {
  const result = await dax.runGovernance({
    input: "Explain quantum computing",
    includeReasons: true
  });
  
  console.log('Governed Output:', result.output);
  console.log('Governance Trace:');
  result.trace.forEach(layer => {
    console.log(`  ${layer.layer}: ${layer.reason}`);
  });
  console.log('Belief State:', result.beliefs);
}

governedResponse();
```

## Session Management Examples

### Multi-turn Conversation

```javascript
async function conversationExample() {
  const sessionId = 'conversation-' + Date.now();
  
  // First message
  const response1 = await dax.generateChat({
    message: "I'm interested in learning about machine learning",
    sessionId: sessionId,
    includeGovernance: true
  });
  
  console.log('AI:', response1.response);
  
  // Follow-up question
  const response2 = await dax.generateChat({
    message: "Can you give me a simple example?",
    sessionId: sessionId
  });
  
  console.log('AI:', response2.response);
  
  // Check session info
  const sessionInfo = await dax.getChatSession(sessionId);
  console.log('Session length:', sessionInfo.messageCount);
  
  // Clean up
  await dax.deleteChatSession(sessionId);
}

conversationExample();
```

### Context-Aware Chat

```javascript
async function contextualChat() {
  const sessionId = 'context-demo';
  
  const responses = await Promise.all([
    dax.generateChat({
      message: "What is photosynthesis?",
      sessionId: sessionId,
      context: ["biology", "science"]
    }),
    dax.generateChat({
      message: "How does it relate to climate change?",
      sessionId: sessionId,
      context: ["environment", "biology"]
    })
  ]);
  
  responses.forEach((resp, i) => {
    console.log(`Response ${i + 1}:`, resp.response);
  });
}

contextualChat();
```

## Advanced Governance Examples

### Custom Layer Configuration

```javascript
async function customGovernance() {
  const result = await dax.runGovernance({
    input: "Analyze the economic impact of renewable energy",
    includeReasons: true,
    layerOverrides: {
      "13": { 
        threshold: 0.9,  // Stricter truth validation
        strict_mode: true 
      },
      "11": { 
        risk_threshold: 0.1,  // Lower risk tolerance
        domains: ["economics", "environment", "policy"]
      },
      "12": { 
        policy_level: "strict"  // Stricter policy compliance
      }
    }
  });
  
  console.log('Custom Governance Result:', result);
}

customGovernance();
```

### Batch Processing

```javascript
async function batchGovernance() {
  const inputs = [
    "What causes climate change?",
    "How do vaccines work?",
    "Explain blockchain technology",
    "What is quantum entanglement?"
  ];
  
  const results = await Promise.all(
    inputs.map(input => 
      dax.runGovernance({
        input,
        includeReasons: true
      })
    )
  );
  
  results.forEach((result, index) => {
    console.log(`Input ${index + 1}:`, inputs[index]);
    console.log(`Output:`, result.output);
    console.log(`Coherence:`, result.beliefs.coherence);
    console.log('---');
  });
}

batchGovernance();
```

### Compliance Validation

```javascript
async function complianceExamples() {
  const testCases = [
    "How to build a computer",
    "Instructions for creating harmful substances",
    "Medical advice for a condition",
    "Legal information for a case"
  ];
  
  for (const testCase of testCases) {
    const validation = await dax.validateCompliance({
      input: testCase,
      policyLevel: "strict"
    });
    
    console.log(`Input: ${testCase}`);
    console.log(`Valid: ${validation.valid}`);
    console.log(`Score: ${validation.compliance_score}`);
    console.log(`Issues: ${validation.issues?.join(', ') || 'None'}`);
    console.log('---');
  }
}

complianceExamples();
```

## Integration Examples

### Web Application Integration

```javascript
// Express.js server with DAX integration
const express = require('express');
const { DAXGovernance } = require('@dax/sdk');

const app = express();
app.use(express.json());

const dax = new DAXGovernance({
  apiKey: process.env.XAI_API_KEY,
  endpoint: process.env.DAX_ENDPOINT || 'http://localhost:3000'
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, includeGovernance } = req.body;
    
    const response = await dax.generateChat({
      message,
      sessionId: sessionId || `session-${Date.now()}`,
      includeGovernance: includeGovernance || false
    });
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Governance validation endpoint
app.post('/api/validate', async (req, res) => {
  try {
    const { input, policyLevel } = req.body;
    
    const validation = await dax.validateCompliance({
      input,
      policyLevel: policyLevel || 'moderate'
    });
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const status = await dax.getSystemStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`DAX integration server running on port ${PORT}`);
});
```

### React Component Integration

```jsx
// React component for DAX chat
import React, { useState, useEffect } from 'react';
import { DAXGovernance } from '@dax/sdk';

const DAXChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [governanceTrace, setGovernanceTrace] = useState(null);
  
  const dax = new DAXGovernance({
    apiKey: process.env.REACT_APP_XAI_API_KEY,
    endpoint: process.env.REACT_APP_DAX_ENDPOINT
  });
  
  useEffect(() => {
    // Initialize session
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await dax.generateChat({
        message: input,
        sessionId,
        includeGovernance: true
      });
      
      const aiMessage = { 
        role: 'assistant', 
        text: response.response,
        beliefs: response.beliefs
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setGovernanceTrace(response.governanceTrace);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'system', 
        text: `Error: ${error.message}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dax-chat">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="text">{msg.text}</div>
            {msg.beliefs && (
              <div className="beliefs">
                <span>Coherence: {msg.beliefs.coherence}</span>
                <span>Reliability: {msg.beliefs.reliability}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {governanceTrace && (
        <div className="governance-trace">
          <h4>Governance Trace:</h4>
          {governanceTrace.map((layer, index) => (
            <div key={index} className="layer">
              <strong>{layer.layer}:</strong> {layer.reason}
            </div>
          ))}
        </div>
      )}
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default DAXChat;
```

### Python Flask Integration

```python
# Flask application with DAX integration
from flask import Flask, request, jsonify
from dax_sdk import DAXGovernance
import os

app = Flask(__name__)

dax = DAXGovernance(
    api_key=os.getenv('XAI_API_KEY'),
    endpoint=os.getenv('DAX_ENDPOINT', 'http://localhost:3000')
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('session_id', f"session-{int(time.time())}")
        
        response = dax.generate_chat(
            message=message,
            session_id=session_id,
            include_governance=data.get('include_governance', False)
        )
        
        return jsonify({
            'success': True,
            'data': response
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/governance', methods=['POST'])
def governance():
    try:
        data = request.json
        input_text = data.get('input')
        
        result = dax.run_governance(
            input=input_text,
            include_reasons=data.get('include_reasons', False)
        )
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

## CLI Examples

### Command Line Interface

```bash
# Basic chat
dax chat "What is artificial intelligence?"

# Chat with session
dax chat "Follow up question" --session-id my-session

# Include governance trace
dax chat "Explain quantum computing" --include-governance

# Run governance on text
dax govern "Your text here" --include-reasons

# Validate compliance
dax validate "Your input" --policy-level strict

# Check system status
dax status

# List available tools
dax tools

# Get layer configuration
dax config --layers 13,12,11
```

### Shell Script Integration

```bash
#!/bin/bash
# dax-batch-process.sh

# Process multiple inputs through DAX governance
INPUTS=(
    "What causes climate change?"
    "How do vaccines work?"
    "Explain blockchain technology"
)

for input in "${INPUTS[@]}"; do
    echo "Processing: $input"
    result=$(dax govern "$input" --include-reasons)
    echo "Result: $result"
    echo "---"
done
```

### Python Script for Batch Processing

```python
#!/usr/bin/env python3
# batch_process.py

import asyncio
import json
from dax_sdk import DAXGovernance

async def batch_process():
    dax = DAXGovernance(
        api_key=os.getenv('XAI_API_KEY'),
        endpoint='http://localhost:3000'
    )
    
    inputs = [
        "What causes climate change?",
        "How do vaccines work?",
        "Explain blockchain technology"
    ]
    
    results = []
    
    for input_text in inputs:
        try:
            result = await dax.run_governance(
                input=input_text,
                include_reasons=True
            )
            results.append({
                'input': input_text,
                'output': result.output,
                'beliefs': result.beliefs,
                'success': True
            })
        except Exception as e:
            results.append({
                'input': input_text,
                'error': str(e),
                'success': False
            })
    
    # Save results
    with open('batch_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Processed {len(inputs)} inputs")
    print(f"Success: {sum(1 for r in results if r['success'])}")
    print(f"Failed: {sum(1 for r in results if not r['success'])}")

if __name__ == '__main__':
    asyncio.run(batch_process())
```

## Testing Examples

### Unit Tests

```javascript
// Jest tests for DAX integration
const { DAXGovernance } = require('@dax/sdk');

describe('DAX Governance Tests', () => {
  let dax;
  
  beforeEach(() => {
    dax = new DAXGovernance({
      apiKey: 'test-key',
      endpoint: 'http://localhost:3000'
    });
  });
  
  test('should generate chat response', async () => {
    const response = await dax.generateChat({
      message: "What is AI?"
    });
    
    expect(response).toHaveProperty('response');
    expect(response).toHaveProperty('beliefs');
    expect(response.beliefs.coherence).toBeGreaterThan(0);
  });
  
  test('should run governance on input', async () => {
    const result = await dax.runGovernance({
      input: "Test input",
      includeReasons: true
    });
    
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('trace');
    expect(result.trace).toHaveLength(14);
  });
  
  test('should validate compliance', async () => {
    const validation = await dax.validateCompliance({
      input: "Safe input",
      policyLevel: "moderate"
    });
    
    expect(validation).toHaveProperty('valid');
    expect(validation).toHaveProperty('compliance_score');
  });
});
```

### Integration Tests

```python
# Python integration tests
import pytest
import asyncio
from dax_sdk import DAXGovernance

@pytest.fixture
async def dax_client():
    dax = DAXGovernance(
        api_key='test-key',
        endpoint='http://localhost:3000'
    )
    yield dax

@pytest.mark.asyncio
async def test_chat_generation(dax_client):
    response = await dax_client.generate_chat(
        message="What is machine learning?"
    )
    
    assert response.response is not None
    assert response.beliefs.coherence > 0
    assert response.session_id is not None

@pytest.mark.asyncio
async def test_governance_processing(dax_client):
    result = await dax_client.run_governance(
        input="Explain photosynthesis",
        include_reasons=True
    )
    
    assert result.output is not None
    assert len(result.trace) == 14
    assert result.beliefs is not None

@pytest.mark.asyncio
async def test_session_management(dax_client):
    session_id = "test-session"
    
    # Create session with first message
    response1 = await dax_client.generate_chat(
        message="Hello",
        session_id=session_id
    )
    
    # Continue session
    response2 = await dax_client.generate_chat(
        message="How are you?",
        session_id=session_id
    )
    
    # Check session info
    session = await dax_client.get_chat_session(session_id)
    
    assert session.message_count == 2
    assert response1.session_id == response2.session_id == session_id
    
    # Clean up
    deleted = await dax_client.delete_chat_session(session_id)
    assert deleted is True
```

## Error Handling Examples

### Robust Error Handling

```javascript
async function robustDAXUsage() {
  const dax = new DAXGovernance({
    apiKey: process.env.XAI_API_KEY,
    endpoint: 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3
  });
  
  try {
    const response = await dax.generateChat({
      message: "Complex question",
      includeGovernance: true
    });
    
    // Check belief scores
    if (response.beliefs.reliability < 0.7) {
      console.warn('Low reliability detected');
    }
    
    if (response.beliefs.hallucination_risk > 0.3) {
      console.warn('High hallucination risk detected');
    }
    
    return response;
    
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      console.error('Input failed validation:', error.details);
      // Handle validation failure
    } else if (error.code === 'TIMEOUT_ERROR') {
      console.error('Request timed out');
      // Handle timeout
    } else if (error.code === 'API_KEY_ERROR') {
      console.error('API key issue');
      // Handle authentication error
    } else {
      console.error('Unexpected error:', error);
    }
    
    // Fallback behavior
    return {
      response: "I'm having trouble processing that request. Please try again.",
      error: error.message
    };
  }
}

robustDAXUsage();
```

### Retry Logic Implementation

```javascript
async function daxWithRetry(input, maxRetries = 3) {
  const dax = new DAXGovernance({
    apiKey: process.env.XAI_API_KEY,
    endpoint: 'http://localhost:3000'
  });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await dax.runGovernance({
        input,
        includeReasons: true
      });
      
      // Check if result is acceptable
      if (result.beliefs.coherence > 0.8) {
        return result;
      }
      
      console.warn(`Attempt ${attempt}: Low coherence, retrying...`);
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

daxWithRetry("Your input here");
```

## Performance Examples

### Optimized Batch Processing

```javascript
async function optimizedBatchProcessing(inputs) {
  const dax = new DAXGovernance({
    apiKey: process.env.XAI_API_KEY,
    endpoint: 'http://localhost:3000',
    maxConcurrency: 5
  });
  
  // Process in batches to avoid overwhelming the system
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = inputs.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(input => 
        dax.runGovernance({
          input,
          includeReasons: false  // Skip reasons for performance
        })
      )
    );
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Failed to process input ${i + index}:`, result.reason);
        results.push({
          input: batch[index],
          error: result.reason.message,
          success: false
        });
      }
    });
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

### Caching Implementation

```javascript
class DAXWithCache {
  constructor(config) {
    this.dax = new DAXGovernance(config);
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }
  
  async runGovernance(input) {
    const cacheKey = this.generateCacheKey(input);
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    const result = await this.dax.runGovernance(input);
    
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  generateCacheKey(input) {
    return btoa(input.input).substring(0, 32);
  }
  
  isExpired(cached) {
    return Date.now() - cached.timestamp > this.cacheTimeout;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Usage
const cachedDAX = new DAXWithCache({
  apiKey: process.env.XAI_API_KEY,
  endpoint: 'http://localhost:3000'
});
```

## Monitoring Examples

### Metrics Collection

```javascript
class DAXMetrics {
  constructor() {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      averageResponseTime: 0,
      beliefScores: []
    };
  }
  
  recordRequest(startTime, success, beliefs) {
    const duration = Date.now() - startTime;
    
    this.metrics.requests++;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requests - 1) + duration) / 
      this.metrics.requests;
    
    if (success) {
      this.metrics.successes++;
      if (beliefs) {
        this.metrics.beliefScores.push({
          coherence: beliefs.coherence,
          reliability: beliefs.reliability,
          timestamp: Date.now()
        });
      }
    } else {
      this.metrics.failures++;
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.successes / this.metrics.requests,
      averageCoherence: this.calculateAverage('coherence'),
      averageReliability: this.calculateAverage('reliability')
    };
  }
  
  calculateAverage(field) {
    const scores = this.metrics.beliefScores.map(s => s[field]);
    return scores.reduce((a, b) => a + b, 0) / scores.length || 0;
  }
}

// Usage
const metrics = new DAXMetrics();

async function measuredDAXCall(input) {
  const startTime = Date.now();
  let success = false;
  let beliefs = null;
  
  try {
    const result = await dax.runGovernance({ input });
    success = true;
    beliefs = result.beliefs;
    return result;
  } catch (error) {
    throw error;
  } finally {
    metrics.recordRequest(startTime, success, beliefs);
  }
}
}
```

These examples demonstrate various ways to integrate and use the DAX DA13-DA13x2 system across different platforms and use cases.
