import "./HeroSection.css";
import DashboardCard from "./DashboardCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { TypeAnimation } from "react-type-animation";

export default function HeroSection() {
  const navigate = useNavigate();

  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-tag", {
        y: 30,
        opacity: 0,
        duration: 0.7,
      });

      gsap.from(".hero-title", {
        y: 80,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power4.out",
      });

      gsap.from(".hero-description", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
      });

      gsap.from(".hero-buttons", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.8,
      });

      gsap.from(".hero-right", {
        x: 120,
        opacity: 0,
        duration: 1.2,
        delay: 0.5,
        ease: "power4.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-left">
        <div className="hero-tag">
          FINOVA • AI Powered Finance
        </div>

      <h1>
  Money,
  <br />

  <span>
    <TypeAnimation
      sequence={[
        "Made Smarter.",
        1800,
        "Budget Better.",
        1800,
        "Save Smarter.",
        1800,
        "Grow Faster.",
        1800,
      ]}
      wrapper="span"
      speed={50}
      repeat={Infinity}
    />
  </span>
</h1>

       <p className="hero-description">
  Your money deserves more than spreadsheets.
  Experience intelligent budgeting, real-time analytics,
  and financial clarity in one beautifully crafted platform.
</p>
        <div className="hero-buttons">
          <button
            className="hero-btn hero-btn-primary"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

          <button
            className="hero-btn hero-btn-secondary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>

      <div className="hero-right">
        <DashboardCard />
      </div>
    </section>
  );
}