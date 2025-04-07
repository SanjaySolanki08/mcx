// controllers/categoryController.js
const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = new Category({ name });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCategory, getAllCategories, deleteCategory };