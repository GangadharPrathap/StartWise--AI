import express from "express";
import multer from "multer";
import { vcController } from "../controllers/vcController.js";
import os from "os";

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

/**
 * AI VC Simulator Routes
 */

// Lifecycle
router.post("/start-session", vcController.startSession);
router.post("/evaluate", vcController.evaluate);

// Interaction
router.post("/chat", vcController.processChat);
router.post("/speech-to-text", upload.single('audio'), vcController.processSpeechToText);
router.post("/text-to-speech", vcController.processTextToSpeech);

export default router;
