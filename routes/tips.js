// routes/tips.js
const express = require("express");
const router = express.Router();
const {
  postTip,
  likeTip,
  commentOnTip,
  getAllTips,
  getTipsByCategory,
  deleteTip,
} = require("../controllers/tipsController");
const auth = require("../middleware/auth");
const { getAllCategories } = require("../controllers/categoryController");
const { deleteComment } = require("../controllers/adminController");
const updateLastActive = require("../middleware/updateLastActive");



  
router.post("/", auth, postTip);
router.post("/:id/like", auth, likeTip);
router.post("/:id/comment", auth, commentOnTip);
router.get("/", getAllTips);
router.get("/category/:category", getTipsByCategory);
router.get("/categories", getAllCategories);
router.delete("/:id", auth, deleteTip);
router.delete("/comments/:id", auth, deleteComment);



module.exports = router;