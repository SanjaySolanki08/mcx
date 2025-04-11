const User = require("../models/User");
const Tip = require("../models/Tip");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const tipPopulation = [
  { path: "author", select: "username profilePhoto" },
  { path: "category", select: "name" },
  { path: "comments", populate: { path: "author", select: "username profilePhoto" } },
];

const postTip = async (req, res) => {
  const { content, category, sentiment } = req.body; // Add sentiment here
  try {
    const user = await User.findById(req.user);
    if (!user || user.accountStatus !== "active") {
      return res.status(403).json({ msg: "User not authorized" });
    }

    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    } else {
      categoryDoc = await Category.findOne({ name: new RegExp(`^${category}$`, "i") });
    }

    if (!categoryDoc) {
      return res.status(400).json({ msg: "Category not found" });
    }

    const tip = new Tip({
      content,
      author: req.user,
      category: categoryDoc._id,
      sentiment: sentiment || 'neutral', // Now sentiment is properly defined
    });

    await tip.save();
    user.lastPostDate = Date.now();
    await user.save();

    const populatedTip = await Tip.populate(tip, tipPopulation);
    res.json(populatedTip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const likeTip = async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id).populate(tipPopulation);
    if (!tip) return res.status(404).json({ msg: "Tip not found" });

    const userId = req.user.toString();
    const likeIndex = tip.likes.indexOf(userId);

    if (likeIndex > -1) {
      tip.likes.splice(likeIndex, 1);
    } else {
      tip.likes.push(userId);
    }

    await tip.save();
    res.json(tip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const commentOnTip = async (req, res) => {
  const { content } = req.body;
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ msg: "Tip not found" });

    const comment = new Comment({
      content,
      author: req.user,
      tip: req.params.id,
    });

    await comment.save();
    tip.comments.push(comment._id);
    await tip.save();

    const populatedComment = await Comment.populate(comment, {
      path: "author",
      select: "username profilePhoto",
    });

    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTips = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  try {
    const tips = await Tip.find()
      .populate(tipPopulation)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTipsByCategory = async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 9 } = req.query;
  try {
    let categoryId;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryId = category;
    } else {
      const categoryDoc = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
      if (!categoryDoc) return res.status(404).json({ msg: 'Category not found' });
      categoryId = categoryDoc._id;
    }

    const tips = await Tip.find({ category: categoryId })
      .populate(tipPopulation)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTip = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(403).json({ msg: "User not authorized" });

    const tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ msg: "Tip not found" });

    const isAdmin = user.role === "admin";
    const isAuthor = tip.author.toString() === req.user.toString();

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ msg: "Authorization required to delete this tip" });
    }

    await Comment.deleteMany({ _id: { $in: tip.comments } });
    await Tip.deleteOne({ _id: req.params.id });
    res.json({ msg: "Tip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const userId = req.user.toString();
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ msg: "You can only delete your own comments" });
    }

    await Comment.deleteOne({ _id: req.params.id });
    await Tip.updateOne({ _id: comment.tip }, { $pull: { comments: comment._id } });
    res.json({ msg: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postTip,
  likeTip,
  commentOnTip,
  getAllTips,
  getTipsByCategory,
  deleteTip,
  deleteComment,
};