import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function Home({ navigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.results().then(setStats).catch(() => {});
  }, []);

  const features = [
    {
      icon: "🔐",
      title: "Cryptographic Security",
      desc: "Every vote is hashed with SHA-256 and chained — tamper-proof by design.",
    },
    {
      icon: "👁",
      title: "Full Transparency",
      desc: "The entire blockchain is publicly auditable. Every block, every vote.",
    },
    {
      icon: "🏗",
      title: "Proof of Work",
      desc: "Each block is mined with a difficulty target ensuring integrity.",
    },
    {
      icon: "🔒",
      title: "Privacy Preserved",
      desc: "Voter IDs are hashed before storage. Anonymous, yet verifiable.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="page-header" style={{ paddingTop: "3rem" }}>
        <div className="badge">🇮🇳 India General Election 2024</div>
        <h1>
          Democracy on the <span className="hl">Blockchain</span>
        </h1>
        <p>
          A transparent, tamper-proof, decentralized voting system built with
          cryptographic blockchain technology. Every vote counts. Every vote is
          verifiable.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("register")}>
            Register to Vote →
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("results")}>
            View Live Results
          </button>
        </div>
      </section>

      {/* Live stats */}
      {stats && (
        <div className="stats-grid animate-in-2" style={{ marginBottom: "3rem" }}>
          <div className="stat-card">
            <div className="stat-value">{stats.total_votes ?? 0}</div>
            <div className="stat-label">Votes Cast</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_registered ?? 0}</div>
            <div className="stat-label">Registered Voters</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.turnout ?? 0}%</div>
            <div className="stat-label">Voter Turnout</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: stats.chain_valid ? "var(--success)" : "var(--danger)" }}>
              {stats.chain_valid ? "✓" : "✗"}
            </div>
            <div className="stat-label">Chain Integrity</div>
          </div>
        </div>
      )}

      {/* Features */}
      <div
        className="animate-in-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {features.map((f) => (
          <div key={f.title} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>{f.title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Steps */}
      <div className="card" style={{ marginTop: "2rem", background: "var(--surface-2)" }}>
        <h2 style={{ fontWeight: 800, marginBottom: "1.5rem", textAlign: "center" }}>
          How It Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
          {[
            ["01", "Register", "Provide your Voter ID and personal details to register on the system."],
            ["02", "Authenticate", "Log in with your Voter ID to access the ballot."],
            ["03", "Vote", "Select your preferred party. Your vote is hashed for privacy."],
            ["04", "Verified", "Your vote is mined into the blockchain — permanent and verifiable."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 700,
                color: "var(--accent)", opacity: 0.4, marginBottom: "0.5rem"
              }}>{num}</div>
              <h4 style={{ fontWeight: 700, marginBottom: "0.35rem" }}>{title}</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
