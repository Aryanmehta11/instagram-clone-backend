const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const postRoutes = require("./routes/posts");

dotenv.config();
const app = express();

app.use(cors({
  origin: "*", // Allow all origins for testing
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/posts", postRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error(err));
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
