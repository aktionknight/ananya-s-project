import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/users/signup", form);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* LEFT PANEL */}

      <div className="register-left">
        <div className="login-logo">
          <div className="logo-box">F</div>

          <div>
            <h1>FINOVA</h1>
            <p>SMART FINANCE</p>
          </div>
        </div>

        <h2>
          Start your
          <br />
          financial journey.
        </h2>

        <p>
          Join thousands of users using FINOVA to track expenses,
          manage budgets, monitor savings and gain AI-powered
          financial insights.
        </p>

        <div className="login-features">
          <div>✓ AI Spending Insights</div>
          <div>✓ Smart Budget Planning</div>
          <div>✓ Secure Cloud Storage</div>
          <div>✓ Beautiful Analytics Dashboard</div>
        </div>
      </div>

      {/* RIGHT PANEL */}

      <div className="register-right">
        

        <div className="register">
          <div className="register__card">
            <h1 className="register__title">
              Create Account
            </h1>

            <p className="register__subtitle">
              Start managing your finances today.
            </p>

            <form
              onSubmit={handleSubmit}
              className="register__form"
            >
              {error && (
                <div className="register__error">
                  {error}
                </div>
              )}

              <div className="register__field">
                <label
                  htmlFor="name"
                  className="register__label"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="register__input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="register__field">
                <label
                  htmlFor="email"
                  className="register__label"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="register__input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="register__field">
                <label
                  htmlFor="password"
                  className="register__label"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="register__input"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="register__submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

              <p className="register__switch">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="register__link"
                >
                  Sign In
                </Link>
              </p>

              <Link
                to="/"
                className="register__back"
              >
                ← Back to Home
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;