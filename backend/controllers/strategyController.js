const axios = require("axios");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Alert = require("../models/Alert");
const mongoose = require("mongoose");

const getStrategy = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactions = await Transaction.find({
      user: req.user,
      date: { $gte: startDate, $lt: endDate }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          type: "expense",
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const alerts = await Alert.find({
      user: req.user._id,
      month
    });

    const context = `
Financial Summary for ${month}

Income: ${totalIncome}
Expenses: ${totalExpense}
Balance: ${balance}

Category Breakdown:
${categoryBreakdown.map(c => `${c._id}: ${c.total}`).join("\n")}

Active Alerts:
${alerts.map(a => `${a.category} - ${a.type}`).join("\n")}
`;

    const prompt = `
You are a professional financial strategist.

Based on the following financial data:

${context}

Create a clear 3-5 step actionable financial improvement strategy.
Make it practical and structured.
`;

    try {
      const response = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3",
        prompt: prompt,
        stream: false
      });

      res.status(200).json({
        strategy: response.data.response
      });

    } catch (aiError) {
      console.warn("Ollama connection failed, returning offline fallback strategy.");
      // Generate dynamically tailored mock recommendations based on the actual categories & overspending alerts
      const topCategories = categoryBreakdown.slice().sort((a,b) => b.total - a.total).slice(0, 2);
      const categoryNames = topCategories.map(c => c._id).join(" and ");
      
      let strategy = `### Tailored Financial Action Plan (Offline Mode)

`;
      if (alerts.length > 0) {
        const exceededCat = alerts.filter(a => a.type === "EXCEEDED").map(a => a.category).join(", ");
        if (exceededCat) {
          strategy += `1. **Urgent Budget Cap:** You have exceeded your budget for **${exceededCat}**. Immediately freeze discretionary purchases in these categories for the rest of this month.\n`;
        } else {
          strategy += `1. **Budget Warning Alert:** You have approached your limit in categories: **${alerts.map(a => a.category).join(", ")}**. Keep a strict watch on spending in the coming days.\n`;
        }
      } else {
        strategy += `1. **Maintain Savings Discipline:** You currently have no active budget alerts. Keep following your general spending guidelines.\n`;
      }

      if (topCategories.length > 0) {
        strategy += `2. **Analyze Key Expenses:** Your highest spending category is **${topCategories[0]._id}** (₹${topCategories[0].total.toLocaleString("en-IN")}). Focus on reducing this category by 10% next month through deliberate choices.\n`;
      } else {
        strategy += `2. **Create Category Budgets:** Head over to the Budget Planner and set limits for your main spending areas (Food, Transport, Rent, Shopping).\n`;
      }

      if (balance < 0) {
        strategy += `3. **Income & Savings Stabilization:** Since you spent more than you earned this month, set up an immediate automated transfer of 15% of your next paycheck directly to a separate savings account to enforce "paying yourself first."\n`;
      } else {
        strategy += `3. **Surplus Optimization:** Since you saved ₹${balance.toLocaleString("en-IN")} this month, consider automating a SIP (Systematic Investment Plan) of ₹${Math.round(balance * 0.5).toLocaleString("en-IN")} into mutual funds or index funds to start growing your wealth compoundedly.\n`;
      }
      strategy += `4. **Review Subscriptions:** Go through all recurring bank statements and cancel any subscriptions you haven't actively used in the last 30 days.`;

      res.status(200).json({
        strategy
      });
    }

  } catch (error) {
    console.error("Strategy Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getStrategy };
