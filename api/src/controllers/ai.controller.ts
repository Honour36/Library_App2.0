import { Request, Response } from "express";
import { generateContent } from "../services/gemini.service";

export const askGemini = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const response = await generateContent(prompt);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
      error: error.message,
    });
  }
};
