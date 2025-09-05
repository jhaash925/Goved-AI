import express from "express";
import mongoose from "mongoose";
import breedsRouter from "./routes/breed.js"; // ✅ only router now
import { breedsData } from "./data/breedsData.js"; // ✅ new import
import BreedResult from "./models/BreedResult.js";


const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cattlebreedAI")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/", breedsRouter);

// Main routes
app.get("/", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("about"));
app.get("/recognition", (req, res) => res.render("recognition"));
app.get("/breedLibrary", (req, res) => res.render("breedLibrary"));

// History page
app.get("/history", async (req, res) => {
  try {
    const results = await BreedResult.find().sort({ createdAt: -1 });
    res.render("history", { results });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading history");
  }
});

// Browse Breeds route
app.get("/breeds", (req, res) => {
  res.render("breeds", { breeds: breedsData });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

