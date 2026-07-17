const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const axios = require("axios");

const getInsights = async (req, res) => {
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

    transactions.forEach((t) => {
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

    const prompt = `
You are a professional financial advisor.

Here is the user's financial data for ${month}:

Total Income: ₹${totalIncome}
Total Expense: ₹${totalExpense}
Balance: ₹${balance}

Category Breakdown:
${categoryBreakdown.map(c => `${c._id}: ₹${c.total}`).join("\n")}

Give a short financial insight (3-4 sentences).
Be practical, actionable, and clear.
`;

    try {
      const llamaResponse = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3",
        prompt,
        stream: false
      });

      res.status(200).json({
        totalIncome,
        totalExpense,
        balance,
        categoryBreakdown,
        insight: llamaResponse.data.response
      });

    } catch (aiError) {
      console.warn("Ollama connection failed, returning offline fallback financial insight.");
      let insight = `Based on your monthly data, you spent ₹${totalExpense.toLocaleString("en-IN")} out of ₹${totalIncome.toLocaleString("en-IN")} income. `;
      if (balance < 0) {
        insight += "**Deficit Warning:** You are currently spending more than your income. We recommend focusing on reducing discretionary expenses in your top categories to avoid accumulating debt.";
      } else {
        const rate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;
        insight += `**Savings Rate:** You successfully saved ₹${balance.toLocaleString("en-IN")} (a savings rate of **${rate}%**). Excellent work! Try setting stricter budget limits for next month to further increase this savings margin.`;
      }
      res.status(200).json({
        totalIncome,
        totalExpense,
        balance,
        categoryBreakdown,
        insight: `[AI Insight (Offline Mode)]: ${insight}`
      });
    }

  } catch (error) {
    console.error("Insight Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getInsights };