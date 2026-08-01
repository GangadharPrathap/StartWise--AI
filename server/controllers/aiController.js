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
  const { idea, slideCount, theme, language, type } = req.body;

  // Try AI-generated content first
  if (GEMINI_API_KEY && GEMINI_API_KEY !== "dummy" && GEMINI_API_KEY !== "your_gemini_api_key_here") {
    try {
      const systemPrompt = `You are an expert startup pitch deck consultant.
Generate a ${slideCount || 6}-slide pitch deck for the given startup idea.
Theme: ${theme || 'Startup'}. Language: ${language || 'English'}. Type: ${type || 'investor'}.
Return ONLY valid JSON (no extra text) with this structure:
{
  "slides": [
    {"slideNumber": number, "title": "string", "content": "string", "speakerNotes": "string"}
  ],
  "metadata": { "startupName": "string", "tagline": "string", "theme": "${theme || 'Startup'}" }
}`;

      const dataStr = await aiService.generateCompletion(systemPrompt, `Idea: ${idea}`);
      const data = JSON.parse(dataStr);
      return sendSuccess(res, data, "AI Presentation generated successfully");
    } catch (error) {
      console.warn("AI pitch deck failed, falling back to templates:", error.message);
    }
  }

  // Fallback to template-based generation
  const data = pitchDeckService.generatePresentationContent(idea, slideCount, theme, language, type);
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
    const systemPrompt = `You are an expert startup architect.
Generate a detailed execution roadmap for this startup idea.
Consider the founder is a ${student_year} year student with these skills: ${existing_skills?.join(", ") || 'No specific skills mentioned'}.
Timeline preference: ${timeline_preference || 'Standard'}. Idea Type: ${idea_type || 'General'}.
Return ONLY valid JSON (no extra text) with this structure:
{
  "idea_summary": "string",
  "idea_viability_score": number (1-10),
  "viability_reasoning": "string",
  "total_estimated_weeks": number,
  "stages": [
    {
      "stage_number": number,
      "stage_name": "string",
      "stage_title": "string",
      "duration_weeks": number,
      "tasks": [{"task": "string", "how_to_do_it": "string"}],
      "checkpoint": "string"
    }
  ],
  "skill_gap_analysis": [
    {"skill_needed": "string", "student_has_it": boolean, "how_to_learn": "string", "time_to_learn_weeks": number}
  ],
  "funding_path": {
    "bootstrap_cost_estimate": "string",
    "stage_for_funding": "string",
    "indian_grants_and_programs": [{"name": "string", "amount": "string", "eligibility": "string", "url": "string"}]
  }
}`;

    const dataStr = await aiService.generateCompletion(systemPrompt, `Idea: ${idea_text}`);
    const data = JSON.parse(dataStr);
    sendSuccess(res, data, "Roadmap generated successfully");
  } catch (error) {
    console.warn("Gemini generateRoadmap failed, using mock:", error.message || error);
    const mockData = roadmapService.generateMockRoadmap(idea_text, student_year, existing_skills);
    sendSuccess(res, mockData, "Roadmap generated successfully (mock)");
  }
});
