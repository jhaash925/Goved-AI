import fs from "fs";
import FormData from "form-data";
import path from "path";
import fetch from "node-fetch";
import BreedResult from "../models/BreedResult.js";
import { breedsData } from "../data/breedsData.js";
import { generateBreedDescription } from "../utils/gemini.js"; // Gemini integration

export const analyzeBreed = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = path.join("uploads", req.file.filename);

    // Prepare image to send to Hugging Face Space API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));

    const response = await fetch(
      "https://aditya-sah-goved-ai-cattle-breed.hf.space/predict",
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Space API error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const result = await response.json();

    // Extract values from Space API response
    const breed = result.breed || "Unknown";
    const confidence = result.confidence !== undefined ? result.confidence : "N/A";
    const annotated_image_url = result.annotated_image_url || null;
    const csv_file_url = result.csv_file_url || null;

    // Get characteristics from breedsData if exists
    const breedInfo = breedsData.find(b => b.name === breed) || {};
    const characteristics = breedInfo.characteristics || [];

    // Generate description dynamically using Gemini AI
    const description = await generateBreedDescription(breed);

    // Save result in MongoDB
    const newResult = new BreedResult({
      image: req.file.filename, // just to keep a record
      breedName: breed,
      confidence,
      description,
      characteristics,
      annotatedImageUrl: annotated_image_url,
      csvFileUrl: csv_file_url
    });

    await newResult.save();

    // 🗑️ Auto-delete uploaded file after saving result
    fs.unlink(imagePath, (err) => {
      if (err) console.error("❌ Failed to delete uploaded file:", err);
    });

    // Send response to frontend (use annotated_image_url instead of local path)
    res.json({
      breed,
      confidence,
      description,
      annotated_image_url,
      csv_file_url
    });

  } catch (err) {
    console.error("❌ Error analyzing breed:", err);
    res.status(500).json({ error: "Error analyzing breed" });
  }
};



