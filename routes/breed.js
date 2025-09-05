import express from "express";
import multer from "multer";
import path from "path";
import { analyzeBreed } from "../controllers/breedController.js";
import { breedsData } from "../data/breedsData.js";
import BreedResult from "../models/BreedResult.js";


const router = express.Router();

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload & Analyze Route
router.post("/breed/analyze", upload.single("file"), analyzeBreed); // key = 'file'

// Browse Breeds Route
router.get("/breeds", (req, res) => {
  res.render("breeds", { breeds: breedsData });
});

// Delete all history
router.delete("/history/delete", async (req, res) => {
  try {
    await BreedResult.deleteMany({});
    res.json({ message: "All history deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete history" });
  }
});

// Delete single history entry
router.delete("/history/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await BreedResult.findByIdAndDelete(id);
    res.json({ message: "History entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});



export { breedsData };   // named export
export default router;   // default export


