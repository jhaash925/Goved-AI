import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate breed description
export async function generateBreedDescription(breedName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =`Write a short and clear description about the cattle breed "${breedName}".
                  Include:
                  1. Description (including origin)
                  2. Characteristics
                  3. Physical traits like height, weight, and lifespan;
                  Keep it concise, under 120 words, and easy to read. Do not use HTML or extra symbols.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    return "Description not available.";
  }
}
