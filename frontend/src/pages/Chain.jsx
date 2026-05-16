import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function Chain() {
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.blockchain().then(setChainData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    api.blockchain().then(setChainData).catch(() => {}).finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="page-header">
        <div className="badge">⛓ Explorer</div>
        <h1>Blockchain <span className="hl">Explorer</span></h1>
        <p>Inspect every block in the chain. Each block links cryptographically to the previous one.</p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <span className="loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      )}

      {!loading && !chainData && (
        <div className="alert alert-error">⚠️ Cannot reach blockchain. Is the backend running?</div>
      )}

      {chainData && (
        <>
          <div className="stats-grid animate-in" style={{ marginBottom: "2rem" }}>
            <div className="stat-card">
              <div className="stat-value">{chainData.length}</div>
              <div className="stat-label">Total Blocks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{chainData.length - 1}</div>
              <div className="stat-label">Votes Recorded</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: chainData.is_valid ? "var(--success)" : "var(--danger)", fontSize: "1.25rem" }}>
                {chainData.is_valid ? "✓ Intact" : "✗ Compromised"}
              </div>
              <div className="stat-label">Chain Integrity</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontWeight: 800 }}>All Blocks ({chainData.length})</h2>
            <button className="btn btn-ghost" onClick={refresh} disabled={loading}>
              ↻ Refresh
            </button>
          </div>

          {chainData.chain.map((block, i) => (
            <div key={block.hash}>
              <div
                className={`chain-block ${block.voter_hash === "GENESIS" ? "genesis" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="block-header">
                  <span className="block-index">
                    {block.voter_hash === "GENESIS" ? "🌱 Genesis Block" : `Block #${block.index}`}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {block.voter_hash !== "GENESIS" && (
                      <span style={{
                        background: "var(--surface-2)", borderRadius: "6px",
                        padding: "0.2rem 0.6rem", fontSize: "0.72rem", color: "var(--accent)"
                      }}>
                        {block.party}
                      </span>
                    )}
                    <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                      {expanded === i ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                <div className="block-hash">
                  Hash: <span>{block.hash.substring(0, 32)}...</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
                  {new Date(block.timestamp).toLocaleString()} · Nonce: {block.nonce}
                </div>

                {expanded === i && (
                  <div style={{
                    marginTop: "1rem", borderTop: "1px solid var(--border)",
                    paddingTop: "1rem", display: "grid", gap: "0.5rem"
                  }}>
                    {[
                      ["Index", block.index],
                      ["Timestamp", block.timestamp],
                      ["Party", block.party],
                      ["Voter Hash", block.voter_hash],
                      ["Previous Hash", block.previous_hash],
                      ["Hash", block.hash],
                      ["Nonce", block.nonce],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.5rem" }}>
                        <span style={{ color: "var(--text-dim)", fontSize: "0.75rem", paddingTop: "0.1rem" }}>{label}</span>
                        <span style={{
                          color: "var(--accent)", fontSize: "0.72rem",
                          wordBreak: "break-all", lineHeight: 1.5
                        }}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {i < chainData.chain.length - 1 && (
                <div className="chain-connector">
                  <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                    ↓ linked by hash
                  </span>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
