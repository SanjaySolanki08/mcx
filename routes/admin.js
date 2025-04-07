const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminController");
const auth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");
const { createCategory, deleteCategory } = require("../controllers/categoryController");
const authMiddleware = require("../middleware/auth");
const updateLastActive = require("../middleware/updateLastActive");

// Apply logVisitor middleware to all routes
// router.use(logVisitor);

// Image upload route
router.post("/upload-image", auth, upload.single("file"), uploadImage);

// Blog routes
router.post("/blogs", auth, upload.single("image"), createAdminBlog);
router.get("/blogs", auth, getBlogs);
router.delete("/blogs/:id", auth, deleteBlog);

// User routes
router.get("/users", auth, getAllUsers);
router.put("/users/:id/deactivate", auth, deactivateUser);
router.put("/users/:id/delete", auth, deleteUser);

// Tip routes
router.post("/tips", auth, createAdminTip);

// Comment routes
router.get("/comments", auth, getComments);
router.delete("/comments/:id", auth, deleteComment);

// Visitor analytics route
router.get("/visitors", auth, getVisitors);
router.get("/admin/previous-visitor-count", getPreviousVisitorCount);

//category
router.post("/categories", auth, createCategory);

// ✅ Delete a category by ID
router.delete("/categories/:id", auth, deleteCategory);

router.get("/online-users", getOnlineUsers );


module.exports = router;