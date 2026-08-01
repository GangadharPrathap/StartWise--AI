import * as aiService from "./geminiService.js";
import vcPromptService from "./vcPromptService.js";

/**
 * VC Conversation Service: Handles modular session logic and context-aware chat
 */
export const vcConversationService = {
  /**
   * Initializes a new session with a starting question
   */
  async startSession(personaKey = 'yc') {
    const persona = vcPromptService.personas[personaKey] || vcPromptService.personas.yc;
    const systemPrompt = vcPromptService.getSystemPrompt(personaKey);
    const initialPrompt = `Start the meeting. Introduce yourself briefly as ${persona.name} and ask the founder to pitch their core idea and unique insight in one sentence.`;
    
    try {
      const responseStr = await aiService.generateCompletion(systemPrompt, initialPrompt, true);
      return JSON.parse(responseStr);
    } catch (error) {
      console.error("Start Session Error:", error);
      return { 
        response: `Hello. I'm ${persona.name}. Let's get straight to it. What are you building and why does the world need it right now?`,
        tone: "Direct",
        confidence: 50,
        metrics: { market: 5, product: 5, team: 5 }
      };
    }
  },

  /**
   * Processes ongoing chat with context memory
   */
  async processChat(message, history = [], personaKey = 'yc') {
    const systemPrompt = vcPromptService.getSystemPrompt(personaKey);
    
    const context = history.slice(-6).map(h => `${h.role === 'user' ? 'Founder' : 'Investor'}: ${h.content}`).join('\n');
    const prompt = `Conversation Context:\n${context}\n\nFounder's new response: ${message}\n\nAnalyze the response, identify gaps, and respond as the investor. Remember to return JSON.`;
    
    try {
      const responseStr = await aiService.generateCompletion(systemPrompt, prompt, true);
      const parsed = JSON.parse(responseStr);
      
      // Clean up response if it has "Investor:" prefix which sometimes Gemini adds
      if (parsed.response && parsed.response.startsWith('Investor:')) {
        parsed.response = parsed.response.replace('Investor:', '').trim();
      }
      
      return parsed;
    } catch (error) {
      console.error("VC Chat Error:", error);
      // Dynamic fallback based on message content
      const msg = message.toLowerCase();
      const fallbacks = [
        { keywords: ['market', 'tam', 'size', 'opportunity'], response: "Interesting. But what's your actual serviceable market? TAM means nothing if you can't reach those customers. How do you plan to acquire your first 1,000 users?", tone: "Skeptical" },
        { keywords: ['revenue', 'money', 'pricing', 'monetize', 'business model'], response: "Walk me through your unit economics. What's your CAC, LTV, and payback period? I need real numbers, not projections.", tone: "Analytical" },
        { keywords: ['team', 'founder', 'cofounder', 'experience'], response: "Why are YOU the right person to build this? What unfair advantage does your team have that a well-funded competitor couldn't replicate?", tone: "Direct" },
        { keywords: ['tech', 'ai', 'machine learning', 'algorithm', 'platform'], response: "Technology is a means, not an end. What specific problem does your tech solve that couldn't be done with a spreadsheet? Show me the 10x improvement.", tone: "Skeptical" },
        { keywords: ['traction', 'users', 'growth', 'customers'], response: "Numbers are encouraging, but what's your retention look like? Show me the cohort data. High signups with low retention is a leaky bucket.", tone: "Analytical" },
        { keywords: ['compete', 'different', 'unique', 'moat'], response: "Every founder says they're unique. But what happens when a big player copies your exact feature set with 100x your budget? What's truly defensible here?", tone: "Critical" },
        { keywords: ['fund', 'invest', 'raise', 'capital', 'seed'], response: "Before we talk money — show me the milestones. What exactly will you accomplish with this round, and how does it de-risk the next round?", tone: "Direct" },
      ];

      const matched = fallbacks.find(f => f.keywords.some(k => msg.includes(k)));
      const fallback = matched || { 
        response: `That's an interesting point. But let me push back — what's the one thing that could kill this company in the next 12 months, and what's your plan to prevent it?`,
        tone: "Skeptical"
      };

      const turnCount = history.filter(h => h.role === 'user').length;
      const confidence = Math.min(30 + turnCount * 8, 75);

      return {
        response: fallback.response,
        tone: fallback.tone,
        confidence,
        metrics: { market: 5 + Math.floor(Math.random() * 3), product: 5 + Math.floor(Math.random() * 3), team: 5 + Math.floor(Math.random() * 3) }
      };
    }
  }
};

export default vcConversationService;
