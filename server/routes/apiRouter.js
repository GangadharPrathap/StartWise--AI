import express from "express";
import * as aiController from "../controllers/aiController.js";
import * as emailController from "../controllers/emailController.js";
import meetingRoutes from "./meetingRoutes.js";
import vcRoutes from "./vcRoutes.js";
import { prisma } from "../lib/prisma.js";
import { getInvestors, getLocalInvestors } from "../services/investorService.js";

const router = express.Router();

router.get('/user/dashboard', async (req, res) => {
  if (!prisma) return res.json({ status: 'success', data: { vcSessions: [], analyses: [], meetings: [] } });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ status: 'success', data: { vcSessions: [], analyses: [], meetings: [] } });
    
    // Get firebaseUid from token (for now extract from client-sent header)
    const firebaseUid = req.headers['x-firebase-uid'];
    if (!firebaseUid) return res.json({ status: 'success', data: { vcSessions: [], analyses: [], meetings: [] } });
    
    const user = await prisma.user.findUnique({ 
      where: { firebaseUid },
      include: {
        vcSessions: { orderBy: { createdAt: 'desc' }, take: 10 },
        meetings: { orderBy: { createdAt: 'desc' }, take: 10 },
        startups: { include: { analyses: { orderBy: { createdAt: 'desc' }, take: 5 } } }
      }
    });
    
    if (!user) return res.json({ status: 'success', data: { vcSessions: [], analyses: [], meetings: [] } });
    
    const analyses = user.startups.flatMap(s => s.analyses);
    
    res.json({ status: 'success', data: {
      vcSessions: user.vcSessions,
      vcSessionCount: user.vcSessions.length,
      avgVCScore: user.vcSessions.length > 0 
        ? Math.round(user.vcSessions.reduce((sum, s) => sum + (s.score?.overall_score || s.score?.overallScore || 0), 0) / user.vcSessions.length)
        : 0,
      analyses: analyses,
      analysisCount: analyses.length,
      meetings: user.meetings,
      meetingCount: user.meetings.length
    }});
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.json({ status: 'success', data: { vcSessions: [], analyses: [], meetings: [] } });
  }
});

router.post('/user/save-analysis', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const { firebaseUid, email, idea, city, result } = req.body;
    let user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      user = await prisma.user.create({ data: { firebaseUid, email } });
    }
    // Upsert startup
    let startup = await prisma.startup.findFirst({ where: { userId: user.id, title: idea.substring(0, 100) } });
    if (!startup) {
      startup = await prisma.startup.create({
        data: {
          userId: user.id,
          title: idea.substring(0, 100),
          description: idea,
          industry: city || 'General'
        }
      });
    }
    const analysis = await prisma.analysis.create({
      data: {
        startupId: startup.id,
        content: result || {},
        score: result?.opportunityScore || null
      }
    });
    res.json({ status: 'success', data: analysis });
  } catch (error) {
    console.error('Analysis save error:', error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

// AI & Analysis Endpoints
router.post("/analyze", aiController.generateAnalysis);
router.post("/roadmap", aiController.generateRoadmap);
router.post("/pitch-deck", aiController.generatePresentation);
router.post("/generate-slides", aiController.generateSlides);
router.post("/suggest-domains", aiController.suggestDomains);

// VC Simulator Endpoints
router.use("/vc", vcRoutes);

// Email Endpoints
router.post("/email-draft", async (req, res, next) => {
  res.json({ status: "success", data: { subject: "Startup Intro", body: "Hello Investor..." } });
});
router.post("/email-send", emailController.sendEmail);

// Investor Endpoints — uses real investor data from investorService
router.post("/investors", async (req, res) => {
  try {
    const { city } = req.body;
    const investors = city ? await getLocalInvestors(city) : await getInvestors();
    res.json({ status: "success", data: investors });
  } catch (error) {
    console.error("Investor fetch error:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch investors" });
  }
});

// Meetings
router.use("/meetings", meetingRoutes);

// Meeting save to PostgreSQL
router.post("/meetings/save", async (req, res) => {
  if (!prisma) return res.status(503).json({ error: "Database unavailable" });
  try {
    const { firebaseUid, email, investorName, scheduledAt, meetingLink } = req.body;
    let user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      user = await prisma.user.create({ data: { firebaseUid, email } });
    }
    const meeting = await prisma.meeting.create({
      data: {
        userId: user.id,
        investorName: investorName || "Unknown Investor",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        meetingLink: meetingLink || null
      }
    });
    res.json({ status: "success", data: meeting });
  } catch (error) {
    console.error("Meeting save error:", error);
    res.status(500).json({ error: "Failed to save meeting" });
  }
});

// VC Session save to PostgreSQL
router.post("/vc/save-session", async (req, res) => {
  if (!prisma) return res.status(503).json({ error: "Database unavailable" });
  try {
    const { email, persona, history, score } = req.body;
    const firebaseUid = req.headers['x-firebase-uid'] || req.body.firebaseUid;
    let user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      user = await prisma.user.create({ data: { firebaseUid, email } });
    }
    const session = await prisma.vCSession.create({
      data: {
        userId: user.id,
        persona: persona || "yc",
        history: history || [],
        score: score || null
      }
    });
    res.json({ status: "success", data: session });
  } catch (error) {
    console.error("VC session save error:", error);
    res.status(500).json({ error: "Failed to save VC session" });
  }
});

// Auth (Mocks for now)
router.post("/auth/login", (req, res) => {
  res.json({ status: "success", data: { user: { name: "Demo User" }, token: "demo-token" } });
});
router.post("/auth/signup", (req, res) => {
  res.json({ status: "success", data: { user: { name: req.body.name }, token: "demo-token" } });
});

export default router;
