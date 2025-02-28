const express = require("express");
const { upload, cloudinary } = require("../cloudinary"); // Import Cloudinary setup
const Post = require("../models/Post");

const router = express.Router();

// ✅ Create Post with Cloudinary Upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Received request:", req.body);
    console.log("Uploaded file details:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, description } = req.body;
    const image = req.file.path; // ✅ Cloudinary secure URL

    const newPost = new Post({ title, description, image });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Upload Error:", err); // Log error
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// ✅ Get All Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Post (Removes from DB + Cloudinary)
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // ✅ Extract Cloudinary public ID correctly
    const publicId = post.image.split("/").pop().split(".")[0]; // Extract filename without extension

    await cloudinary.uploader.destroy(publicId); // Delete from Cloudinary
    await Post.findByIdAndDelete(req.params.id); // Delete from DB

    res.status(200).json({ message: "Post and image deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err); // Log error
    res.status(500).json({ error: err.message });
  }
});


// ✅ Update Post (with optional Cloudinary Image Update)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // If a new image is uploaded, delete the old one from Cloudinary
    if (req.file) {
      const publicId = post.image.split("/").pop().split(".")[0]; // Extract filename
      await cloudinary.uploader.destroy(publicId); // Delete old image
      post.image = req.file.path; // Update with new Cloudinary URL
    }

    // Update fields
    post.title = title || post.title;
    post.description = description || post.description;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

module.exports = router;
