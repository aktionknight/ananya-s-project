import "./Features.css";
import {
  Wallet,
  Brain,
  PieChart,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: <Wallet size={36} />,
    title: "Expense Tracking",
    text: "Track every transaction in one beautiful dashboard.",
  },
  {
    icon: <Brain size={36} />,
    title: "AI Insights",
    text: "Receive smart recommendations to improve your spending habits.",
  },
  {
    icon: <PieChart size={36} />,
    title: "Advanced Analytics",
    text: "Visualize your financial health with interactive charts.",
  },
  {
    icon: <ShieldCheck size={36} />,
    title: "Secure Platform",
    text: "Your financial information is protected with modern security.",
  },
];

export default function Features() {
  return (
    <section className="features-section">

      <p className="section-tag">
        WHY FINOVA
      </p>

      <h2>
        Everything you need to
        manage your finances
      </h2>

      <div className="features-grid">

        {features.map((item, index) => (

          <div className="feature-card" key={index}>

            <div className="feature-icon">
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>

          </div>

        ))}

      </div>

    </section>
  );
}