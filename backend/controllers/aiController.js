const Transaction = require("../models/Transaction");
const axios = require("axios");

/* ==============================
   AI CHAT
============================== */
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const savings = totalIncome - totalExpense;

    const prompt = `
You are a financial advisor AI.

User Financial Summary:
Income: ₹${totalIncome}
Expense: ₹${totalExpense}
Savings: ₹${savings}

User Question:
${message}

Respond clearly and professionally.
`;

    try {
      const llamaResponse = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: "llama3",
          prompt,
          stream: false,
        }
      );

      res.json({ reply: llamaResponse.data.response });
    } catch (aiError) {
      console.warn("Ollama connection failed, returning offline fallback reply.");
      const msgLower = message.toLowerCase();
      let reply = "";

      if (msgLower.includes("saving")) {
        reply = `Your current net savings are ₹${savings.toLocaleString("en-IN")} (Income: ₹${totalIncome.toLocaleString("en-IN")}, Expenses: ₹${totalExpense.toLocaleString("en-IN")}). ` + 
                (savings > 0 ? "You're in the green! Aim to save at least 20% of your total income monthly." : "You have negative savings this month. Let's look at reducing non-essential expenses.");
      } else if (msgLower.includes("spending") || msgLower.includes("expense") || msgLower.includes("most")) {
        reply = `You have spent a total of ₹${totalExpense.toLocaleString("en-IN")} this month. We recommend checking the Budget Planner to see where you've set limits, and looking at the Category breakdown chart on the dashboard.`;
      } else if (msgLower.includes("budget") || msgLower.includes("overspend")) {
        reply = `Category-wise budgets are a great way to stay on track. Currently, you have logged ₹${totalExpense.toLocaleString("en-IN")} in expenses. Go to the Budget Planner link at the top right of your dashboard to configure category limits!`;
      } else {
        reply = `Hello! I'm your offline finance helper. Currently, your income is ₹${totalIncome.toLocaleString("en-IN")} and your expenses are ₹${totalExpense.toLocaleString("en-IN")}. What specific area of your budgets or savings can I help you analyze today?`;
      }

      res.json({ reply: `[AI Chatbot (Offline Mode)]: ${reply}` });
    }

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "AI error" });
  }
};

/* ==============================
   AI INSIGHTS
============================== */
const generateInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const savings = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0
        ? ((savings / totalIncome) * 100).toFixed(1)
        : 0;

    const prompt = `
You are a professional financial advisor.

Analyze this financial data:

Income: ₹${totalIncome}
Expense: ₹${totalExpense}
Savings: ₹${savings}
Savings Rate: ${savingsRate}%

Provide:
1. Risk Level (Low / Medium / High)
2. One key insight
3. One actionable suggestion

Keep response structured and concise.
`;

    try {
      const llamaResponse = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: "llama3",
          prompt,
          stream: false,
        }
      );

      res.json({
        insight: llamaResponse.data.response,
      });
    } catch (aiError) {
      console.warn("Ollama connection failed, returning offline fallback insights.");
      let riskLevel = "Low";
      if (savingsRate < 10) riskLevel = "High";
      else if (savingsRate < 25) riskLevel = "Medium";

      const fallbackInsight = `**Risk Level:** ${riskLevel}

**Key Insight:** You spent ₹${totalExpense.toLocaleString("en-IN")} out of ₹${totalIncome.toLocaleString("en-IN")}, resulting in a savings rate of **${savingsRate}%**.

**Actionable Suggestion:** ${savingsRate < 20 ? "Focus on cutting down non-essential entertainment and shopping categories, and set strict budgets." : "Keep up the great work! Consider automating 10% of your savings into long-term investments."}`;

      res.json({
        insight: `[AI Insights (Offline Mode)]:\n\n${fallbackInsight}`,
      });
    }

  } catch (error) {
    console.error("AI Insight Error:", error);
    res.status(500).json({ message: "AI insight error" });
  }
};

/* ==============================
   EXPORTS
============================== */
module.exports = {
  chatWithAI,
  generateInsights,
};