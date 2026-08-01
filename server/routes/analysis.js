import express from "express";
import { prisma } from "../lib/prisma.js";
import * as geminiService from "../services/geminiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { startupId, title, description, industry } = req.body;

    let analysisResult;
    try {
      const systemPrompt = `You are a world-class startup strategist and VC analyst.
Analyze this startup idea in detail and return a JSON object with:
{
  "marketValidation": "string",
  "competitorAnalysis": "string", 
  "swotAnalysis": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "monetizationStrategy": "string",
  "startupScore": number (1-100),
  "executionRoadmap": "string",
  "fundingPotential": "string",
  "marketTrendFit": "string"
}`;
      const dataStr = await geminiService.generateCompletion(
        systemPrompt,
        `Title: ${title}\nDescription: ${description}\nIndustry: ${industry}`
      );
      analysisResult = JSON.parse(dataStr);
    } catch (aiError) {
      console.warn("AI analysis failed, using basic result:", aiError.message);
      analysisResult = {
        marketValidation: "Analysis temporarily unavailable",
        competitorAnalysis: "Please try again later",
        swotAnalysis: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        monetizationStrategy: "N/A",
        startupScore: 50,
        executionRoadmap: "N/A",
        fundingPotential: "N/A",
        marketTrendFit: "N/A"
      };
    }

    // If database is available, save the analysis
    if (prisma && startupId) {
      const savedAnalysis = await prisma.analysis.create({
        data: {
          startupId,
          content: analysisResult
        }
      });
      return res.json(savedAnalysis);
    }

    // If no DB, return the analysis result directly
    res.json({
      id: `temp-${Date.now()}`,
      content: analysisResult,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Analysis Failed" });
  }
});

export default router;