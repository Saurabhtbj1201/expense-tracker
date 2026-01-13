const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    
    // Get spending for each category (current month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
    const categoriesWithSpending = await Promise.all(
      categories.map(async (category) => {
        const spending = await Expense.aggregate([
          {
            $match: {
              user: req.user._id,
              category: category._id,
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        
        return {
          ...category.toObject(),
          spending: spending.length > 0 ? spending[0].total : 0
        };
      })
    );
    
    res.json(categoriesWithSpending);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, color, budget } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const category = new Category({
      user: req.user._id,
      name,
      icon: icon || '📁',
      color: color || '#3b82f6',
      budget: budget || 0
    });
    
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, color, budget } = req.body;
    
    // Find category
    let category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update fields
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (budget !== undefined) category.budget = budget;
    
    await category.save();
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has expenses
    const expenseCount = await Expense.countDocuments({
      category: req.params.id
    });
    
    if (expenseCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing expenses. Please reassign or delete expenses first.' 
      });
    }
    
    await category.deleteOne();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
