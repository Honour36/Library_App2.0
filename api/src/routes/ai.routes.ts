import { Router } from "express";
import { askGemini } from "../controllers/ai.controller";
import { protect } from "../middleware/auth";

const router = Router();

// Protect the AI route so only authenticated users can use it
router.post("/ask", protect, askGemini);

export default router;
