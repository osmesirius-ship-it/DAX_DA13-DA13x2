import { GovernanceResult } from './dax-core';

export interface ChatInput {
  message: string;
  sessionId?: string;
  includeGovernance?: boolean;
  context?: string[];
}

export interface ChatResponse {
  response: string;
  governanceTrace?: GovernanceResult['trace'];
  sessionId: string;
  timestamp: string;
  beliefs?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActivity: string;
}

export class ChatInterface {
  private sessions: Map<string, ChatSession> = new Map();
  private daxCore: any; // DAXGovernanceCore instance

  constructor(daxCore: any) {
    this.daxCore = daxCore;
  }

  async generateChat(input: ChatInput): Promise<ChatResponse> {
    const sessionId = input.sessionId || this.generateSessionId();
    
    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      this.sessions.set(sessionId, session);
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: input.message,
      timestamp: new Date().toISOString(),
    });

    // Build context-aware input
    let fullInput = input.message;
    if (input.context && input.context.length > 0) {
      fullInput = `Context: ${input.context.join('\n')}\n\nUser: ${input.message}`;
    }

    // Add recent conversation history for context
    const recentMessages = session.messages.slice(-6); // Last 3 exchanges
    if (recentMessages.length > 0) {
      const history = recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      fullInput = `Recent conversation:\n${history}\n\nCurrent request: ${fullInput}`;
    }

    // Process through governance layers
    const governanceResult = await this.daxCore.runGovernance({
      input: fullInput,
      includeReasons: input.includeGovernance || false,
    });

    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      content: governanceResult.output,
      timestamp: new Date().toISOString(),
    });

    // Update session activity
    session.lastActivity = new Date().toISOString();

    // Get current belief states if governance was included
    let beliefs;
    if (input.includeGovernance) {
      beliefs = this.daxCore.getLoopStates();
    }

    return {
      response: governanceResult.output,
      governanceTrace: governanceResult.trace,
      sessionId,
      timestamp: new Date().toISOString(),
      beliefs,
    };
  }

  getSession(sessionId: string): ChatSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Session persistence (optional)
  async saveSession(sessionId: string, filePath?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const path = filePath || `${process.env.BELIEFS_PATH || './data/beliefs'}/chat_session_${sessionId}.json`;
    
    // This would require fs module - for now, just log
    console.log(`Session ${sessionId} would be saved to ${path}`);
  }

  async loadSession(sessionId: string, filePath?: string): Promise<void> {
    const path = filePath || `${process.env.BELIEFS_PATH || './data/beliefs'}/chat_session_${sessionId}.json`;
    
    // This would require fs module - for now, just log
    console.log(`Session ${sessionId} would be loaded from ${path}`);
  }
}
