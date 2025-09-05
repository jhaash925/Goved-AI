import mongoose from "mongoose";

const breedSchema = new mongoose.Schema({
  name: String,
  description: String,
  origin: String,
  image: String
});

export default mongoose.model("Breed", breedSchema);
