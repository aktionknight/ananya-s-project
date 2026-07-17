import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Cell } from "recharts";
import {
  Sparkles,
  Wallet,
  Target,
  Plus,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Award,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";
import AIChatbot from "./AIChatbot";
import ExportButton from "./ExportButton";
import CategoryChart from "./CategoryChart";
import ThemeToggle from "./ThemeToggle";

const API_BASE = "http://localhost:5000/api";
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const CIRCUMFERENCE = 2 * Math.PI * 90;

const useCountUp = (value, duration = 800) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const counter = setInterval(() => {
      start += increment;
      if (start >= value) { start = value; clearInterval(counter); }
      setDisplayValue(Math.floor(start));
    }, 16);
    return () => clearInterval(counter);
  }, [value, duration]);
  return displayValue;
};

function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

function HealthRing({ score }) {
  const ringRef = useRef(null);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  useEffect(() => {
    if (ringRef.current) {
      setTimeout(() => { ringRef.current.style.strokeDashoffset = offset; }, 100);
    }
  }, [offset]);
  return (
    <div className="health-score__ring">
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle className="ring-bg" cx="100" cy="100" r="90" />
        <circle ref={ringRef} className="ring-fill" cx="100" cy="100" r="90"
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: CIRCUMFERENCE }} />
      </svg>
      <div className="health-score__inner">
        <div className="health-score__number">{score}</div>
        <div className="health-score__out-of">out of 100</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip-glass">
      {payload.map((entry, index) => (
        <div key={index} className="chart-tooltip-glass__row" style={{ color: entry.fill }}>
          {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ₹{entry.value}
        </div>
      ))}
    </div>
  );
};

// Shared motion presets so every card enters with the same, deliberate rhythm
const fadeUpIn = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

const lift = {
  whileHover: { y: -6, transition: { duration: 0.25 } },
};

function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState("this");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "";

  const incomeAnimated = useCountUp(analytics?.income || 0);
  const expenseAnimated = useCountUp(analytics?.expense || 0);
  const savingsAnimated = useCountUp(analytics?.savings || 0);

  const chartData = analytics ? [{ name: "Overview", income: analytics.income || 0, expense: analytics.expense || 0, savings: analytics.savings || 0 }] : [];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const loadData = async () => {
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      try {
        setLoading(true);
        setError(null);
        const [healthRes, predictionRes, transactionRes, recommendationRes, analyticsRes, categoryRes] =
          await Promise.all([
            fetch(`${API_BASE}/health-score?month=${CURRENT_MONTH}`, { headers }),
            fetch(`${API_BASE}/predict?month=${CURRENT_MONTH}`, { headers }),
            fetch(`${API_BASE}/transactions`, { headers }),
            fetch(`${API_BASE}/recommendations?month=${CURRENT_MONTH}`, { headers }),
            fetch(`${API_BASE}/analytics?range=${range}`, { headers }),
            fetch(`${API_BASE}/transactions/category-summary`, { headers }),
          ]);
        if (healthRes.ok) setHealth(await healthRes.json());
        if (predictionRes.ok) setPrediction(await predictionRes.json());
        else setPredictionError("Prediction failed.");
        if (transactionRes.ok) setTransactions(await transactionRes.json());
        if (recommendationRes.ok) setRecommendation(await recommendationRes.json());
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (categoryRes.ok) setCategoryData(await categoryRes.json());
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
      try {
        const insightRes = await fetch(`${API_BASE}/ai/insights`, { headers });
        if (insightRes.ok) { const data = await insightRes.json(); setAiInsight(data.insight); }
      } catch (err) { console.error("AI insight load error:", err); }
    };

    loadData();
  }, [navigate, range]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ambient glow orbs, echoing the homepage hero background */}
      <div className="dashboard__glow dashboard__glow--a" />
      <div className="dashboard__glow dashboard__glow--b" />

      <div className="dashboard__content">

        {/* ── HERO HEADER ───────────────────────── */}
        <motion.header
          className="dashboard__header"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="dashboard__header-left">
            <div>
              <div className="dashboard__tag">
                <Sparkles size={13} />
                FINOVA • Live Dashboard
              </div>
              <h1 className="dashboard__title">
                Welcome back{userName ? `, ${userName}` : ""} 👋
              </h1>
              <p className="dashboard__subtitle">
                Here's your financial overview for today.
              </p>
            </div>
          </div>

          <div className="dashboard__actions">
            <ThemeToggle />
            <ExportButton transactions={transactions} />
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="btn btn--secondary" onClick={() => navigate("/budget")}>
              <Target size={15} /> Budgets
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="btn btn--primary" onClick={() => navigate("/add-transaction")}>
              <Plus size={15} /> Add
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="btn btn--secondary" onClick={() => navigate("/profile")}>
              <User size={15} /> Profile
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="btn btn--ghost" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {error && (
            <motion.div className="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOADING SKELETON ───────────────────────── */}
        {loading && (
          <div className="dashboard__grid">
            <div className="skeleton-card span-1">
              <div className="skeleton-label"></div>
              <div className="skeleton-ring-wrap"><div className="skeleton-ring"></div></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-card span-1">
              <div className="skeleton-label"></div>
              <div className="skeleton-grid"><div className="skeleton-stat"></div><div className="skeleton-stat"></div></div>
              <div className="skeleton-line"></div>
            </div>
            <div className="skeleton-card span-1">
              <div className="skeleton-label"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line skeleton-line--short"></div>
            </div>
            <div className="skeleton-card span-3">
              <div className="skeleton-label"></div>
              <div className="skeleton-grid"><div className="skeleton-stat"></div><div className="skeleton-stat"></div><div className="skeleton-stat"></div></div>
              <div className="skeleton-chart"></div>
            </div>
            <div className="skeleton-card span-3">
              <div className="skeleton-label"></div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-tx-row">
                  <div className="skeleton-tx-left">
                    <div className="skeleton-dot"></div>
                    <div><div className="skeleton-line skeleton-line--med"></div><div className="skeleton-line skeleton-line--xs"></div></div>
                  </div>
                  <div className="skeleton-line skeleton-line--short"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BENTO GRID ───────────────────────── */}
        {!loading && (
          <div className="dashboard__grid">

            {health && (
              <motion.div className="card health-card span-1" {...fadeUpIn} {...lift}>
                <div className="card__header">
                  <h3><Award size={13} /> Financial Health</h3>
                </div>
                <div className="health-score">
                  <HealthRing score={health.score} />
                  <div className="health-score__badge">
                    <Award size={16} />
                    Grade {getGrade(health.score)}
                  </div>
                  <div className="health-score__text">{health.message}</div>
                </div>
              </motion.div>
            )}

            {prediction && (
              <motion.div className="card prediction-card span-1" {...fadeUpIn} {...lift}>
                <div className="card__header">
                  <h3><Activity size={13} /> Spending Prediction</h3>
                  <div className="card__header-icon"><TrendingUp size={16} color="#0b1120" /></div>
                </div>
                <div className="prediction-stats">
                  <div>
                    <span className="label">Spent</span>
                    <div className="value value--danger">₹{prediction.currentExpense}</div>
                  </div>
                  <div>
                    <span className="label">Projected</span>
                    <div className="value value--warning">₹{prediction.projectedExpense}</div>
                  </div>
                </div>
                <p className="prediction-message">{prediction.message}</p>
              </motion.div>
            )}

            {recommendation && (
              <motion.div className="card recommendation-card span-1" {...fadeUpIn} {...lift}>
                <div className="recommendation-header">
                  <div>
                    <h3 className="recommendation-title"><Sparkles size={15} /> Smart Advice</h3>
                    <p className="recommendation-subtitle">AI-powered monthly analysis</p>
                  </div>
                </div>
                <div className="savings-badge">
                  {recommendation?.savingsRate || 0}%
                  <span>Savings Rate</span>
                </div>
                <div className="recommendation-body">
                  <div className="recommendation-chip">
                    Top Expense:
                    <span className="recommendation-chip__value">{recommendation?.topExpenseCategory || "No expense data"}</span>
                  </div>
                  <p className="recommendation-text">{recommendation?.advice || ""}</p>
                </div>
              </motion.div>
            )}

            <motion.div className="card ai-insight-card span-3" {...fadeUpIn} {...lift}>
              <div className="ai-insight-header">
                <div className="ai-insight-icon"><Brain size={22} /></div>
                <div>
                  <h3 className="ai-insight-title">AI Financial Intelligence</h3>
                  <p className="ai-insight-sub">Powered by your financial data</p>
                </div>
              </div>
              <div className="ai-insight-body">
                {aiInsight ? (
                  aiInsight.split(/\n+/).filter(line => line.trim()).map((line, i) => {
                    const headerMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
                    if (headerMatch) {
                      return (
                        <div key={i} className="ai-insight-section">
                          <div className="ai-insight-section-label">{headerMatch[1]}</div>
                          {headerMatch[2] && (
                            <p className="ai-insight-section-text"
                              dangerouslySetInnerHTML={{ __html: headerMatch[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                          )}
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="ai-insight-plain"
                        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                    );
                  })
                ) : (
                  <div className="ai-insight-loading">
                    <div className="ai-insight-spinner" />
                    <p>Analyzing your finances... this may take a moment.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {analytics && (
              <motion.div className="card analytics-card span-3" {...fadeUpIn} {...lift}>
                <div className="glass-header">
                  <h3>Financial Overview</h3>
                  <div className="glass-dropdown">
                    <div className="glass-dropdown-selected" onClick={() => setOpenDropdown(!openDropdown)}>
                      {range === "this" && "This Month"}
                      {range === "last" && "Last Month"}
                      {range === "all" && "All Time"}
                      <ChevronDown size={14} className={`arrow ${openDropdown ? "arrow--open" : ""}`} />
                    </div>
                    <AnimatePresence>
                      {openDropdown && (
                        <motion.div
                          className="glass-dropdown-menu"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div onClick={() => { setRange("this"); setOpenDropdown(false); }}>This Month</div>
                          <div onClick={() => { setRange("last"); setOpenDropdown(false); }}>Last Month</div>
                          <div onClick={() => { setRange("all"); setOpenDropdown(false); }}>All Time</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="glass-stats">
                  <div className="stat income">
                    <div className="stat__icon"><ArrowUpRight size={16} /></div>
                    <div><span>Income</span><h2>₹{incomeAnimated}</h2></div>
                  </div>
                  <div className="stat expense">
                    <div className="stat__icon"><ArrowDownRight size={16} /></div>
                    <div><span>Expense</span><h2>₹{expenseAnimated}</h2></div>
                  </div>
                  <div className="stat savings">
                    <div className="stat__icon"><PiggyBank size={16} /></div>
                    <div><span>Savings</span><h2>₹{savingsAnimated}</h2></div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" /><stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff4d6d" /><stop offset="100%" stopColor="#ff8fa3" />
                      </linearGradient>
                      <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="income" fill="url(#incomeGradient)" radius={[12, 12, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[12, 12, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="savings" fill="url(#savingsGradient)" radius={[12, 12, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            <div className="span-3">
              <CategoryChart categoryData={categoryData} />
            </div>

            {transactions.length > 0 && (
              <motion.div className="card span-3" {...fadeUpIn} {...lift}>
                <div className="card__header"><h3><Wallet size={13} /> Recent Transactions</h3></div>
                <div className="transactions-list">
                  {transactions.map((txn) => (
                    <div key={txn._id} id={txn._id} className="transaction-row">
                      <div className="transaction-left">
                        <div className={`transaction-icon transaction-icon--${txn.type}`}>
                          {txn.type === "income" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div>
                          <div className="transaction-category">{txn.category}</div>
                          <div className="transaction-date">{new Date(txn.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="transaction-right">
                        <div className={`transaction-amount transaction-amount--${txn.type}`}>
                          {txn.type === "income" ? "+" : "-"} ₹{txn.amount}
                        </div>
                        <button className="delete-btn" onClick={async (e) => {
                          const button = e.currentTarget;
                          const ripple = document.createElement("span");
                          ripple.classList.add("ripple");
                          const rect = button.getBoundingClientRect();
                          ripple.style.left = `${e.clientX - rect.left}px`;
                          ripple.style.top = `${e.clientY - rect.top}px`;
                          button.appendChild(ripple);
                          setTimeout(() => ripple.remove(), 600);
                          const token = localStorage.getItem("token");
                          const row = document.getElementById(txn._id);
                          row.classList.add("transaction-row--removing");
                          setTimeout(async () => {
                            await fetch(`${API_BASE}/transactions/${txn._id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setTransactions(prev => prev.filter(t => t._id !== txn._id));
                          }, 300);
                        }}>
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        )}

      </div>
      <AIChatbot />
    </motion.div>
  );
}

export default Dashboard;