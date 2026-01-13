const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// @route   GET /api/subscriptions
// @desc    Get all subscriptions for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const query = { user: req.user._id };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const subscriptions = await Subscription.find(query)
      .populate('category', 'name icon color')
      .sort({ nextPaymentDate: 1 });
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get single subscription
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category', 'name icon color');
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, amount, category, frequency, nextPaymentDate, startDate, description, isPaid, lastPaidDate } = req.body;
    
    // Validation
    if (!name || !amount || !category || !nextPaymentDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const subscription = new Subscription({
      user: req.user._id,
      name,
      amount,
      category,
      frequency,
      nextPaymentDate,
      startDate: startDate || Date.now(),
      description,
      isPaid: isPaid || false,
      lastPaidDate: lastPaidDate || null
    });
    
    await subscription.save();
    await subscription.populate('category', 'name icon color');
    
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, amount, category, frequency, nextPaymentDate, isActive, description, isPaid, lastPaidDate } = req.body;
    
    // Find subscription
    let subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Update fields
    if (name) subscription.name = name;
    if (amount) subscription.amount = amount;
    if (category) subscription.category = category;
    if (frequency) subscription.frequency = frequency;
    if (nextPaymentDate) subscription.nextPaymentDate = nextPaymentDate;
    if (isActive !== undefined) subscription.isActive = isActive;
    if (description !== undefined) subscription.description = description;
    if (isPaid !== undefined) subscription.isPaid = isPaid;
    if (lastPaidDate !== undefined) subscription.lastPaidDate = lastPaidDate;
    
    await subscription.save();
    await subscription.populate('category', 'name icon color');
    
    res.json(subscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete subscription
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
