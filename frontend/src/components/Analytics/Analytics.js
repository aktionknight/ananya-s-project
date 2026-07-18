import "./Analytics.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip
} from "recharts";

import CountUp from "react-countup";

const data = [
  { month: "Jan", income: 18 },
  { month: "Feb", income: 24 },
  { month: "Mar", income: 20 },
  { month: "Apr", income: 32 },
  { month: "May", income: 29 },
  { month: "Jun", income: 38 }
];

export default function Analytics() {

  return (

    <section className="analytics">

      <div className="analytics-left">

        <p className="analytics-tag">
          ANALYTICS
        </p>

        <h2>
          Understand Your
          Spending Like Never Before.
        </h2>

        <p className="analytics-desc">
          Beautiful reports, AI insights and
          real-time analytics to help you make
          smarter financial decisions.
        </p>

        <div className="analytics-stats">

          <div className="stat">
            <h3><CountUp end={95}/> %</h3>
            <p>Budget Accuracy</p>
          </div>

          <div className="stat">
            <h3>₹<CountUp end={4200000} separator=","/></h3>
            <p>Money Tracked</p>
          </div>

          <div className="stat">
            <h3><CountUp end={12000} separator=","/>+</h3>
            <p>Transactions</p>
          </div>

          <div className="stat">
            <h3>24/7</h3>
            <p>AI Insights</p>
          </div>

        </div>

      </div>

      <div className="analytics-chart">

        <ResponsiveContainer width="100%" height={420}>

          <AreaChart data={data}>

            <defs>

              <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">

                <stop offset="0%" stopColor="#22C55E" stopOpacity=".6"/>

                <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>

              </linearGradient>

            </defs>

            <XAxis dataKey="month" stroke="#666"/>

            <Tooltip/>

            <Area
              type="monotone"
              dataKey="income"
              stroke="#22C55E"
              strokeWidth={4}
              fill="url(#green)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </section>

  );

}