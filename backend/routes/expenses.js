const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all expenses for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, startDate, endDate, limit = 100 } = req.query;
    
    const query = { user: req.user._id };
    
    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const expenses = await Expense.find(query)
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/recent
// @desc    Get recent expenses
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .limit(5);
    
    res.json(expenses);
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category', 'name icon color');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date, description, paymentMethod } = req.body;
    
    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const expense = new Expense({
      user: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
      paymentMethod
    });
    
    await expense.save();
    await expense.populate('category', 'name icon color');
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, category, date, description, paymentMethod } = req.body;
    
    // Find expense
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Update fields
    if (title) expense.title = title;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (date) expense.date = date;
    if (description !== undefined) expense.description = description;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    
    await expense.save();
    await expense.populate('category', 'name icon color');
    
    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
