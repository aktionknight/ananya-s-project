import "./Navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">

      {/* LEFT */}

      <div className="navbar-left">

        <div className="logo">

          <div className="logo-icon">

            <svg
              width="42"
              height="42"
              viewBox="0 0 64 64"
            >
              <rect
                x="6"
                y="6"
                width="52"
                height="52"
                rx="16"
                fill="#181818"
                stroke="#2c2c2c"
                strokeWidth="2"
              />

              <path
                d="M22 18H42V24H28V31H38V37H28V46H22V18Z"
                fill="#22C55E"
              />
            </svg>

          </div>

          <div className="logo-text">
            <h2>FINOVA</h2>
            <p>SMART FINANCE</p>
          </div>

        </div>

      </div>

      {/* CENTER */}

      <div className="navbar-center">

        <a href="/">Home</a>

        <a href="/">Features</a>

        <a href="/">Analytics</a>

        <a href="/">Pricing</a>

      </div>

      {/* RIGHT */}

      <div className="navbar-right">

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          className="signup-btn"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>

      </div>

    </nav>
  );
}