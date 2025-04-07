const User = require("../models/User");
const Tip = require("../models/Tip");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Visitor = require("../models/Visitor");

// Middleware to log visitors
const logVisitor = async (req, res, next) => {
  try {
    const ip = req.ip; // Use request IP
    const page = req.originalUrl; // Use request URL

    // Mock geolocation (replace with real service in production)
    const mockGeolocation = {
      city: "New York",
      country: "USA",
      latitude: 40.7128,
      longitude: -74.0060,
    };

    const visitor = new Visitor({
      ip,
      page,
      city: mockGeolocation.city,
      country: mockGeolocation.country,
      latitude: mockGeolocation.latitude,
      longitude: mockGeolocation.longitude,
      visitedAt: new Date(),
    });

    await visitor.save();
    next();
  } catch (error) {
    console.error("Error logging visitor:", error);
    next(); // Continue even if logging fails
  }
};

// Get visitor count from 7 days ago
const getPreviousVisitorCount = async (req, res) => {
  try {
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 7);
    const startOfDay = new Date(previousDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(previousDate.setHours(23, 59, 59, 999));

    const visitorCount = await Visitor.countDocuments({
      visitedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    res.json({ count: visitorCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get online users
const getOnlineUsers = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await User.find({ 
      lastActive: { $gte: fiveMinutesAgo },
      accountStatus: { $ne: "deleted" }
    });
    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get visitor analytics
const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Existing endpoints
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Ensure the file is sent in a field named 'file'." });
    }
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image: " + error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.accountStatus = "inactive";
    await user.save();
    res.json({ msg: "User deactivated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.accountStatus = "deleted";
    user.isDeleted = true;
    await user.save();
    res.json({ msg: "User marked as deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAdminTip = async (req, res) => {
  const { content } = req.body;
  try {
    const tip = new Tip({ content, author: req.user._id });
    await tip.save();
    res.json(tip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAdminBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const blog = new Blog({
      title,
      content,
      author: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    await blog.save();
    const populatedBlog = await Blog.findById(blog._id).populate("author", "email");
    res.status(201).json({ msg: "Blog uploaded and live", blog: populatedBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "email");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: "Blog not found" });
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ msg: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate("author", "email").populate("tip", "content");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    await Comment.deleteOne({ _id: req.params.id });
    res.json({ msg: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadImage,
  getBlogs,
  getAllUsers,
  deactivateUser,
  deleteUser,
  createAdminTip,
  createAdminBlog,
  deleteBlog,
  getComments,
  deleteComment,
  logVisitor,
  getVisitors,
  getPreviousVisitorCount,
  getOnlineUsers,
};