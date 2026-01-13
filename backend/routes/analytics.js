const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month spending
    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month spending
    const lastMonthExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Category-wise spending (current month)
    const categorySpending = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 1,
          name: '$category.name',
          icon: '$category.icon',
          color: '$category.color',
          total: 1,
          count: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Daily spending trend (last 30 days)
    const last30Days = new Date(now.setDate(now.getDate() - 30));
    const dailySpending = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const currentTotal = currentMonthExpenses.length > 0 ? currentMonthExpenses[0].total : 0;
    const lastTotal = lastMonthExpenses.length > 0 ? lastMonthExpenses[0].total : 0;
    const percentageChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    res.json({
      currentMonth: {
        total: currentTotal,
        count: currentMonthExpenses.length > 0 ? currentMonthExpenses[0].count : 0,
        percentageChange: percentageChange.toFixed(2)
      },
      categorySpending,
      dailySpending,
      paymentMethods
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/monthly
// @desc    Get monthly spending summary
// @access  Private
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyData = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing months with 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = months.map((month, index) => {
      const data = monthlyData.find(d => d._id === index + 1);
      return {
        month,
        total: data ? data.total : 0,
        count: data ? data.count : 0
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
