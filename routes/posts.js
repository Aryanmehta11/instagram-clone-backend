const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Create Post
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newPost = new Post({
      title,
      description,
      image: `/uploads/${req.file.filename}`,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Delete Post
router.delete("/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

module.exports = router;
