import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

import './auth.less'

const API_BASE = import.meta.env.VITE_API_BASE;
const API_URL = `${API_BASE}/api/auth/register`;



export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Register error");

      login(data.user, data.token);
      navigate("/mycards");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (min 4)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button disabled={loading}>{loading ? "..." : "Register"}</button>
        {error && <p>{error}</p>}
      </form>
      <p>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}
