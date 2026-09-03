import * as aiService from "../services/geminiService.js";
import * as aiLogicService from "../services/aiLogicService.js";
import * as roadmapService from "../services/roadmapService.js";
import * as pitchDeckService from "../services/pitchDeckService.js";
import { GEMINI_API_KEY } from "../config/env.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const generateSlides = catchAsync(async (req, res, next) => {
  const { idea, currentSlidesCount = 0, additionalCount = 4 } = req.body;

  if (GEMINI_API_KEY && GEMINI_API_KEY !== "dummy") {
    try {
      const systemPrompt = `You are an expert startup pitch deck consultant.
Generate ${additionalCount} additional pitch deck slides for the given startup idea, starting from slide number ${currentSlidesCount + 1}.
Return ONLY valid JSON (no extra text) with this exact structure:
{
  "pitchSlides": [
    {"slideNumber": number, "title": "string", "content": "string"}
  ]
}`;

      const dataStr = await aiService.generateCompletion(systemPrompt, `Idea: ${idea}`);
      const data = JSON.parse(dataStr);
      return sendSuccess(res, data, "Slides generated successfully");
    } catch (error) {
      console.warn("Gemini generateSlides failed, using mock:", error.message);
    }
  }

  // Fallback: generate template slides
  const fallbackSlides = [];
  const templates = ["Traction", "Go-To-Market", "Financial Projections", "Competitive Advantage", "Roadmap", "The Ask"];
  for (let i = 0; i < additionalCount; i++) {
    fallbackSlides.push({
      slideNumber: currentSlidesCount + i + 1,
      title: templates[i % templates.length],
      content: `Key points about ${templates[i % templates.length].toLowerCase()} for your startup: ${idea || 'your idea'}. Customize this slide with your actual data and metrics.`
    });
  }
  sendSuccess(res, { pitchSlides: fallbackSlides }, "Slides generated (template)");
});

export const generateAnalysis = catchAsync(async (req, res, next) => {
  const { idea, city } = req.body;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "dummy") {
    console.warn("Gemini API key is missing. Falling back to mock generation.");
    const mockData = aiLogicService.generateMockDashboard(idea, city);
    return sendSuccess(res, mockData, "Mock analysis generated");
  }

  try {
    const systemPrompt = `You are an expert startup analyst for the Indian market.
Analyze the given startup idea for the city of ${city} and return ONLY valid JSON (no extra text) with this exact structure:
{
  "marketSize": "string (e.g. '$2.4B')",
  "marketAnalysisDetails": "string (detailed analysis of the market)",
  "competitors": [{"name": "string", "description": "string"}],
  "opportunityScore": number (1-10),
  "targetCustomer": "string",
  "revenueModel": "string",
  "pitchSlides": [
    {"slideNumber": number, "title": "string", "content": "string"}
  ],
  "investorEmail": {
    "subject": "string",
    "body": "string (professional 150-word email)"
  },
  "localInvestors": [{"name": "string", "address": "string", "uri": "string", "lat": number, "lng": number}]
}`;

    const dataStr = await aiService.generateCompletion(systemPrompt, `Idea: ${idea}\nCity: ${city}`);
    const data = JSON.parse(dataStr);
    sendSuccess(res, data, "Analysis generated successfully");
  } catch (error) {
    console.warn("Gemini generateAnalysis failed, using mock:", error.message || error);
    const mockData = aiLogicService.generateMockDashboard(idea, city);
    sendSuccess(res, mockData, "Analysis generated successfully (mock)");
  }
});

export const generatePresentation = catchAsync(async (req, res, next) => {
  const { idea, slideCount, theme, language, type, analysisResult } = req.body;

  // Build context from analysis result if available
  let analysisContext = '';
  if (analysisResult) {
    analysisContext = `
ANALYSIS DATA (use these real numbers in the slides):
- Market Size: ${analysisResult.marketSize || 'Not available'}
- Opportunity Score: ${analysisResult.opportunityScore || 'N/A'}/10
- Target Customer: ${analysisResult.targetCustomer || 'Not specified'}
- Revenue Model: ${analysisResult.revenueModel || 'Not specified'}
- Target City: ${analysisResult.city || 'India'}
- Market Details: ${analysisResult.marketAnalysisDetails || ''}
- Competitors: ${analysisResult.competitors?.map(c => `${c.name}: ${c.description}`).join('; ') || 'Not analyzed'}`;
  }

  // Try AI-generated content first
  if (GEMINI_API_KEY && GEMINI_API_KEY !== "dummy" && GEMINI_API_KEY !== "your_gemini_api_key_here") {
    try {
      const systemPrompt = `You are an expert startup pitch deck consultant who has helped founders raise $100M+ in funding.
Generate a ${slideCount || 8}-slide investor pitch deck for the startup idea below.

CRITICAL RULES:
1. Every slide MUST be specific to this exact startup idea: "${idea}"
2. Use real numbers from the analysis data provided (market size, competitors, etc.)
3. Do NOT use placeholder text like "Your Company" or "XYZ". Use the actual startup concept.
4. Slides should tell a compelling story: Problem → Solution → Market → Product → Business Model → Traction → Team → Ask
5. Include specific Indian market context (Indian cities, INR amounts, Indian competitors)
6. Each slide should have 3-4 bullet points with concrete, specific information
7. Speaker notes should guide the founder on what to say and how to present each slide
${analysisContext}

Theme: ${theme || 'Startup'}. Language: ${language || 'English'}. Audience: ${type || 'investor'}.

Return ONLY valid JSON (no extra text) with this structure:
{
  "slides": [
    {
      "slideNumber": number,
      "title": "Slide title (specific to the idea)",
      "content": "2-3 sentence main content with specific details about this startup",
      "bullets": ["Specific bullet point 1", "Specific bullet point 2", "Specific bullet point 3"],
      "speakerNotes": "What the founder should say when presenting this slide"
    }
  ],
  "metadata": { "startupName": "string", "tagline": "string", "theme": "${theme || 'Startup'}" }
}`;

      const dataStr = await aiService.generateCompletion(systemPrompt, `STARTUP IDEA: ${idea}\n\nGenerate a pitch deck that tells the compelling story of this specific startup. Every slide must reference the actual idea, market, and data.`);
      const data = JSON.parse(dataStr);
      return sendSuccess(res, data, "AI Presentation generated successfully");
    } catch (error) {
      console.warn("AI pitch deck failed, falling back to templates:", error.message);
    }
  }

  // Fallback to template-based generation (enhanced to be more idea-specific)
  const data = pitchDeckService.generatePresentationContent(idea, slideCount, theme, language, type);
  
  // Convert template format to the simpler slide format the frontend expects
  if (data.slides) {
    data.slides = data.slides.map(s => ({
      slideNumber: s.slideNumber,
      title: s.title,
      content: s.content || s.subtitle || '',
      bullets: s.bulletPoints || [],
      speakerNotes: s.speakerNotes || ''
    }));
  }
  
  sendSuccess(res, data, "Presentation generated successfully");
});

export const suggestDomains = catchAsync(async (req, res, next) => {
  const { idea_text } = req.body;

  try {
    const systemPrompt = `You are an expert startup domain analyzer.
Analyze the startup idea and identify key domains (tech, business, legal, etc.) needed for collaboration.
Return ONLY valid JSON (no extra text) with this structure:
{
  "overall_confidence": number (0-1),
  "reasoning_summary": "string",
  "domains": [
    {
      "name": "string",
      "priority": "primary" | "secondary" | "cross-domain",
      "category": "technical" | "business" | "scientific" | "legal" | "design" | "social",
      "reason": "string",
      "confidence": number (0-1)
    }
  ]
}`;

    const dataStr = await aiService.generateCompletion(systemPrompt, `Idea: ${idea_text}`);
    const data = JSON.parse(dataStr);
    sendSuccess(res, data, "Domains suggested successfully");
  } catch (error) {
    console.warn("Gemini suggestDomains failed, using mock:", error.message || error);
    const mockData = roadmapService.generateMockDomains(idea_text);
    sendSuccess(res, mockData, "Domains suggested successfully (mock)");
  }
});

export const generateRoadmap = catchAsync(async (req, res, next) => {
  const { idea_text, student_year, existing_skills, timeline_preference, idea_type } = req.body;

  try {
    const skillsList = existing_skills?.length > 0 ? existing_skills.join(", ") : 'No specific skills mentioned';
    
    const systemPrompt = `You are an expert startup execution strategist who has helped 100+ Indian startups go from idea to launch.
Your job is to create a HIGHLY SPECIFIC, ACTIONABLE execution roadmap for the exact startup idea given below.

CRITICAL RULES:
1. Every stage name, task, and milestone MUST be directly related to "${idea_text}". Do NOT give generic startup advice.
2. Tasks should mention specific tools, platforms, APIs, and frameworks relevant to THIS particular idea.
3. Include India-specific advice: Indian payment gateways (Razorpay, PhonePe), Indian hosting (Railway, Vercel), Indian legal (DPIIT, GST), Indian grants (Startup India, TIDE 2.0).
4. The skill gap analysis should compare what's needed for THIS specific idea vs what the student already knows.
5. Each task's "how_to_do_it" should be a practical 2-3 sentence instruction, not vague advice.
6. Stage names should reflect the actual product being built (e.g., "Build Food Ordering Flow" not just "Development Phase").

FOUNDER PROFILE:
- Student Year: ${student_year || 'Not specified'}
- Existing Skills: ${skillsList}
- Timeline: ${timeline_preference || 'Standard (6 months)'}
- Idea Type: ${idea_type || 'General'}

Generate a roadmap with 5-7 stages, each with 3-5 specific tasks.

Return ONLY valid JSON (no extra text) with this structure:
{
  "idea_summary": "A 2-sentence summary of what this startup does and who it serves",
  "idea_viability_score": number (1-10),
  "viability_reasoning": "Why this score — mention market size, competition, and feasibility for a ${student_year || ''} student",
  "total_estimated_weeks": number,
  "stages": [
    {
      "stage_number": number,
      "stage_name": "Specific name related to the idea (e.g., 'Restaurant Partner Onboarding' not 'Phase 1')",
      "stage_title": "What gets accomplished in this stage",
      "duration_weeks": number,
      "tasks": [
        {
          "task": "Specific task name related to the idea",
          "how_to_do_it": "2-3 sentence practical instruction with specific tools/platforms"
        }
      ],
      "checkpoint": "What must be true before moving to next stage"
    }
  ],
  "skill_gap_analysis": [
    {
      "skill_needed": "Specific skill needed for THIS idea",
      "student_has_it": boolean,
      "how_to_learn": "Specific course or resource recommendation",
      "time_to_learn_weeks": number
    }
  ],
  "funding_path": {
    "bootstrap_cost_estimate": "Realistic cost estimate in INR",
    "stage_for_funding": "Which stage is right to seek external funding",
    "indian_grants_and_programs": [
      {
        "name": "Name of the grant/program",
        "amount": "Grant amount",
        "eligibility": "Who can apply",
        "url": "Application URL"
      }
    ]
  }
}`;

    const dataStr = await aiService.generateCompletion(systemPrompt, `STARTUP IDEA: ${idea_text}\n\nGenerate a detailed, idea-specific execution roadmap for this exact startup. Every task and stage should be tailored to building "${idea_text}".`);
    const data = JSON.parse(dataStr);
    sendSuccess(res, data, "Roadmap generated successfully");
  } catch (error) {
    console.warn("Gemini generateRoadmap failed, using mock:", error.message || error);
    const mockData = roadmapService.generateMockRoadmap(idea_text, student_year, existing_skills);
    sendSuccess(res, mockData, "Roadmap generated successfully (mock)");
  }
});
