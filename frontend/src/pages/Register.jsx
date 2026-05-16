import { useState } from "react";
import { api } from "../utils/api";

export default function Register({ navigate }) {
  const [form, setForm] = useState({ voter_id: "", name: "", age: "" });
  const [status, setStatus] = useState(null); // {type, message}
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.voter_id || !form.name || !form.age) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.register({ ...form, age: parseInt(form.age) });
      if (res.success) {
        setStatus({ type: "success", message: "Registered successfully! You can now cast your vote." });
        setForm({ voter_id: "", name: "", age: "" });
      } else {
        setStatus({ type: "error", message: res.message });
      }
    } catch {
      setStatus({ type: "error", message: "Could not connect to server. Is the backend running?" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="page-header">
        <div className="badge">Step 01</div>
        <h1>Voter <span className="hl">Registration</span></h1>
        <p>Register once with your Voter ID. Each citizen may cast exactly one vote.</p>
      </div>

      <div className="card animate-in">
        {status && (
          <div className={`alert alert-${status.type === "success" ? "success" : "error"}`}>
            <span>{status.type === "success" ? "✅" : "⚠️"}</span>
            <span>{status.message}</span>
          </div>
        )}

        <div className="input-group">
          <label>Voter ID</label>
          <input
            name="voter_id"
            placeholder="e.g. VOT-2024-001"
            value={form.voter_id}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Full Name</label>
          <input
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Age</label>
          <input
            name="age"
            type="number"
            placeholder="Must be 18 or older"
            min={18}
            max={120}
            value={form.age}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="loader" /> Registering...</> : "Register as Voter →"}
        </button>

        {status?.type === "success" && (
          <button
            className="btn btn-gold"
            style={{ width: "100%", marginTop: "0.75rem" }}
            onClick={() => navigate("vote")}
          >
            Proceed to Vote →
          </button>
        )}
      </div>

      <div className="card" style={{ marginTop: "1rem", background: "var(--surface-2)" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          🔐 Your Voter ID is <strong style={{ color: "var(--text)" }}>hashed with SHA-256</strong> before
          storage. We never store your raw ID in the database. Registration is a one-time process.
        </p>
      </div>
    </div>
  );
}
