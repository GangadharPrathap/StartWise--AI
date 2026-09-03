import * as aiService from "./geminiService.js";
import vcPromptService from "./vcPromptService.js";

/**
 * Meeting phases — the AI follows this natural investor meeting flow.
 * Each phase focuses on different aspects, ensuring progressive questioning.
 */
const MEETING_PHASES = [
  { name: 'introduction', turns: [0, 1], focus: 'Core idea and unique insight' },
  { name: 'market', turns: [2, 3], focus: 'Market size, TAM/SAM/SOM, target customer, timing' },
  { name: 'product', turns: [4, 5], focus: 'Product details, differentiation, tech, traction' },
  { name: 'business_model', turns: [6, 7], focus: 'Revenue model, unit economics, pricing, margins' },
  { name: 'team_and_moat', turns: [8, 9], focus: 'Team, competitive moat, defensibility' },
  { name: 'closing', turns: [10, 99], focus: 'Funding ask, milestones, use of funds, risks' },
];

function getMeetingPhase(turnCount) {
  for (const phase of MEETING_PHASES) {
    if (turnCount >= phase.turns[0] && turnCount <= phase.turns[1]) {
      return phase;
    }
  }
  return MEETING_PHASES[MEETING_PHASES.length - 1];
}

/**
 * Extracts previous investor questions from history to prevent repetition
 */
function extractPreviousQuestions(history) {
  return history
    .filter(h => h.role === 'assistant')
    .map(h => h.content)
    .join('\n');
}

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
   * Processes ongoing chat with full context memory and progressive questioning
   */
  async processChat(message, history = [], personaKey = 'yc') {
    const systemPrompt = vcPromptService.getSystemPrompt(personaKey);
    const userTurnCount = history.filter(h => h.role === 'user').length;
    const currentPhase = getMeetingPhase(userTurnCount);
    const previousInvestorResponses = extractPreviousQuestions(history);
    
    // Build full conversation context (use up to last 12 messages for better memory)
    const context = history.slice(-12).map(h => 
      `${h.role === 'user' ? 'Founder' : 'Investor'}: ${h.content}`
    ).join('\n');
    
    const prompt = `FULL CONVERSATION SO FAR:
${context}

Founder's latest message: "${message}"

CURRENT MEETING PHASE: ${currentPhase.name} (Focus: ${currentPhase.focus})
This is turn ${userTurnCount + 1} of the meeting.

PREVIOUS INVESTOR QUESTIONS (DO NOT repeat any of these):
${previousInvestorResponses}

CRITICAL RULES:
1. You MUST ask a DIFFERENT question than any you've asked before. Read the previous questions above carefully.
2. Your question must be relevant to what the founder just said — react to their specific answer.
3. If the founder's answer is vague, push back on the SAME topic with a sharper follow-up before moving on.
4. If the founder answered well, acknowledge it briefly and move to the next aspect: ${currentPhase.focus}.
5. Reference specific claims, numbers, or statements the founder made earlier to show you're listening.
6. Keep your response conversational and natural — like a real investor meeting, not an interview.

Return your response as JSON.`;
    
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
      return this._getProgressiveFallback(message, history, userTurnCount, currentPhase);
    }
  },

  /**
   * Progressive fallback: asks different questions based on meeting phase
   * so even without AI, the conversation moves forward naturally.
   */
  _getProgressiveFallback(message, history, turnCount, currentPhase) {
    const msg = message.toLowerCase();
    
    // Phase-specific fallback questions (each phase has unique questions)
    const phaseQuestions = {
      introduction: [
        { response: "That's an interesting space. But before we dive in — what specific problem are you solving, and how did you personally discover this pain point?", tone: "Curious" },
        { response: "OK, I get the concept. But tell me — why now? What's changed in the market or technology that makes this the right time for this solution?", tone: "Analytical" },
      ],
      market: [
        { response: "Let's talk numbers. What's your total addressable market? And more importantly, what's your realistic serviceable market in Year 1?", tone: "Analytical" },
        { response: "Who is your ideal customer? Give me a specific persona — their age, income, behavior. And how much would they pay for this?", tone: "Direct" },
        { response: "You mentioned the market size. But how concentrated is this market? Are there 3 big players owning 80% or is it fragmented? That changes everything.", tone: "Skeptical" },
      ],
      product: [
        { response: "Walk me through the actual user experience. A customer discovers you — what happens in the first 60 seconds? Where's the 'aha moment'?", tone: "Curious" },
        { response: "What's your tech stack and what's proprietary? If someone with 10x your budget tried to clone this tomorrow, what would be hard for them to replicate?", tone: "Skeptical" },
        { response: "Do you have any traction yet? Users, revenue, waitlist, LOIs — give me any signal that the market actually wants this.", tone: "Direct" },
      ],
      business_model: [
        { response: "Break down your unit economics for me. What's your Customer Acquisition Cost, Lifetime Value, and what's the payback period?", tone: "Analytical" },
        { response: "What's your pricing strategy? How did you arrive at that price point? Have you tested willingness to pay with actual customers?", tone: "Direct" },
        { response: "What are your gross margins? And what does your path to profitability look like? When do you expect to break even?", tone: "Analytical" },
      ],
      team_and_moat: [
        { response: "Tell me about your team. What's each person's unfair advantage? Why are YOU the right people to build this specific company?", tone: "Direct" },
        { response: "What's your competitive moat? Network effects, data advantages, switching costs, brand — which one are you building and how far along is it?", tone: "Skeptical" },
        { response: "What happens when a well-funded incumbent notices you? What's your playbook for competing against someone with 100x your resources?", tone: "Critical" },
      ],
      closing: [
        { response: "How much are you raising, and what specific milestones will you hit with this capital? I want to see the bridge to your next round.", tone: "Direct" },
        { response: "What's the single biggest risk that could kill this company in the next 12 months? And what's your specific mitigation plan?", tone: "Critical" },
        { response: "If I invest today, what does my exit look like? Who acquires you, or are you building for IPO? What's the 5-year vision?", tone: "Analytical" },
      ],
    };

    // First try keyword-matched response for relevance to what user said
    const keywordResponses = [
      { keywords: ['market', 'tam', 'size', 'opportunity', 'billion', 'million', 'crore'], response: "Those are top-down numbers. I want bottom-up. How many customers can you realistically reach in 12 months, at what price, with what conversion rate? Show me the math.", tone: "Skeptical" },
      { keywords: ['revenue', 'money', 'pricing', 'monetize', 'business model', 'subscription', 'commission'], response: "Walk me through your unit economics. What's your CAC, LTV, and payback period? I need real numbers, not projections.", tone: "Analytical" },
      { keywords: ['team', 'founder', 'cofounder', 'experience', 'background'], response: "Experience is one thing, but obsession is another. Are you solving this because it's a good opportunity, or because you HAVE to solve it? What's the personal story?", tone: "Direct" },
      { keywords: ['tech', 'ai', 'machine learning', 'algorithm', 'platform', 'app'], response: "Technology is a means, not an end. Show me how your tech creates a 10x improvement over existing solutions. What can you do that a spreadsheet or a competitor can't?", tone: "Skeptical" },
      { keywords: ['traction', 'users', 'growth', 'customers', 'download', 'signups'], response: "Growth numbers are encouraging. But what's your retention look like? Show me the weekly or monthly cohort data. A leaky bucket with high signups is still a leaky bucket.", tone: "Analytical" },
      { keywords: ['compete', 'different', 'unique', 'moat', 'advantage'], response: "Every founder says they're unique. But what happens when a big player copies your features with 100x your budget? What's truly defensible — network effects, data, switching costs?", tone: "Critical" },
      { keywords: ['fund', 'invest', 'raise', 'capital', 'seed', 'round', 'valuation'], response: "Before we talk money — show me the milestones. What exactly will you accomplish with this round, and how does it de-risk the next round?", tone: "Direct" },
    ];

    // Try keyword match first
    const matched = keywordResponses.find(f => f.keywords.some(k => msg.includes(k)));
    
    // If keyword matched, use that; otherwise use phase-specific question
    let selectedResponse;
    if (matched) {
      selectedResponse = matched;
    } else {
      const phaseQ = phaseQuestions[currentPhase.name] || phaseQuestions.closing;
      // Pick a question based on turn count within the phase to avoid repeating
      const idx = turnCount % phaseQ.length;
      selectedResponse = phaseQ[idx];
    }

    const confidence = Math.min(25 + turnCount * 7, 80);

    return {
      response: selectedResponse.response,
      tone: selectedResponse.tone,
      confidence,
      metrics: { 
        market: Math.min(3 + Math.floor(turnCount * 0.8), 8), 
        product: Math.min(3 + Math.floor(turnCount * 0.6), 8), 
        team: Math.min(3 + Math.floor(turnCount * 0.5), 7) 
      }
    };
  }
};

export default vcConversationService;
