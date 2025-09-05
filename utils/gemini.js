import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate breed description
export async function generateBreedDescription(breedName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Write a short, clear description about the cattle breed "${breedName}". 
    Include its origin, characteristics, and why it is unique. Keep it under 120 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    return "Description not available.";
  }
}
