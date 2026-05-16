import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function Results() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await api.results();
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="badge">🔴 Live Results</div>
        <h1>Election <span className="hl">Results</span></h1>
        <p>Real-time vote tally sourced directly from the blockchain. Refreshes every 10 seconds.</p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <span className="loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: "1rem" }}>Loading results...</p>
        </div>
      )}

      {!loading && !data && (
        <div className="alert alert-error">
          ⚠️ Could not load results. Is the backend server running?
        </div>
      )}

      {data && (
        <>
          <div className="stats-grid animate-in">
            <div className="stat-card">
              <div className="stat-value">{data.total_votes}</div>
              <div className="stat-label">Total Votes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.total_registered}</div>
              <div className="stat-label">Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "var(--gold)" }}>{data.turnout}%</div>
              <div className="stat-label">Turnout</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: data.chain_valid ? "var(--success)" : "var(--danger)" }}>
                {data.chain_valid ? "✓ Valid" : "✗ Corrupt"}
              </div>
              <div className="stat-label">Chain Status</div>
            </div>
          </div>

          {data.total_votes === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗳</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>No votes yet</h3>
              <p style={{ color: "var(--text-muted)" }}>Be the first to cast your vote!</p>
            </div>
          ) : (
            <div className="animate-in-2">
              {data.results.map((party, i) => (
                <div key={party.name} className="result-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="result-header">
                    <div className="result-party-info">
                      <div className={`rank ${i === 0 ? "gold" : ""}`}>#{i + 1}</div>
                      <span style={{ fontSize: "1.5rem" }}>{party.symbol}</span>
                      <div>
                        <div style={{ fontWeight: 800 }}>{party.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{party.candidate}</div>
                      </div>
                    </div>
                    <div className="result-votes">
                      <strong>{party.votes}</strong> votes &nbsp;
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>{party.percentage}%</span>
                    </div>
                  </div>
                  <div className="result-bar-bg">
                    <div
                      className="result-bar-fill"
                      style={{
                        width: `${party.percentage}%`,
                        background: i === 0
                          ? `linear-gradient(90deg, ${party.color}, var(--gold))`
                          : party.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.results.length > 0 && data.total_votes > 0 && (
            <div className="card" style={{ marginTop: "1.5rem", background: "var(--surface-2)", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🏆</div>
              <h3 style={{ fontWeight: 800 }}>
                Leading: {data.results[0]?.name} — {data.results[0]?.candidate}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                {data.results[0]?.percentage}% of votes counted so far
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
