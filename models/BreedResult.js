import mongoose from "mongoose";

const breedResultSchema = new mongoose.Schema(
  {
    breedName: { type: String, required: true },      // detected breed
    confidence: { type: Number, required: true },     // confidence %
    description: { type: String, default: "No description available." }, // Gemini AI description
    characteristics: { type: [String], default: [] }, // breed characteristics
    annotatedImageUrl: { type: String, default: null }, // annotated image URL from Space API
    csvFileUrl: { type: String, default: null }       // CSV download URL from Space API
  },
  { timestamps: true }
);

const BreedResult = mongoose.model("BreedResult", breedResultSchema);

export default BreedResult;
