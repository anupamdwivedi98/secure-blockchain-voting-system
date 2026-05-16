import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function Vote({ navigate }) {
  const [step, setStep] = useState("login"); // login | ballot | confirm | done
  const [voterId, setVoterId] = useState("");
  const [parties, setParties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [block, setBlock] = useState(null);

  useEffect(() => {
    api.parties().then(setParties).catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!voterId.trim()) {
      setAlert({ type: "error", message: "Please enter your Voter ID." });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const res = await api.verify(voterId.trim());
      if (!res.registered) {
        setAlert({ type: "error", message: "Voter ID not found. Please register first." });
      } else if (res.has_voted) {
        setAlert({ type: "error", message: "You have already cast your vote." });
      } else {
        setStep("ballot");
        setAlert(null);
      }
    } catch {
      setAlert({ type: "error", message: "Cannot connect to server." });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selected) {
      setAlert({ type: "error", message: "Please select a party." });
      return;
    }
    setStep("confirm");
  };

  const confirmVote = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const res = await api.vote({ voter_id: voterId.trim(), party: selected });
      if (res.success) {
        setBlock(res.block);
        setStep("done");
      } else {
        setAlert({ type: "error", message: res.message });
        setStep("ballot");
      }
    } catch {
      setAlert({ type: "error", message: "Server error. Please try again." });
      setStep("ballot");
    } finally {
      setLoading(false);
    }
  };

  const selectedParty = parties.find((p) => p.name === selected);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="page-header">
        <div className="badge">Step 02</div>
        <h1>Cast Your <span className="hl-gold">Vote</span></h1>
        <p>Your vote is encrypted, hashed, and permanently recorded on the blockchain.</p>
      </div>

      {/* Step: Login */}
      {step === "login" && (
        <div className="card animate-in">
          {alert && (
            <div className={`alert alert-${alert.type === "error" ? "error" : "success"}`}>
              <span>⚠️</span>{alert.message}
            </div>
          )}
          <div className="input-group">
            <label>Your Voter ID</label>
            <input
              placeholder="e.g. VOT-2024-001"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleLogin} disabled={loading}>
            {loading ? <><span className="loader" /> Verifying...</> : "Access Ballot →"}
          </button>
          <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
            Not registered?{" "}
            <button onClick={() => navigate("register")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>
              Register here →
            </button>
          </p>
        </div>
      )}

      {/* Step: Ballot */}
      {step === "ballot" && (
        <div className="animate-in">
          <div className="alert alert-info" style={{ marginBottom: "1.5rem" }}>
            🗳 Welcome! Select one party to cast your vote. This action cannot be undone.
          </div>
          {alert && (
            <div className="alert alert-error"><span>⚠️</span>{alert.message}</div>
          )}
          <div className="party-grid">
            {parties.map((p) => (
              <div
                key={p.name}
                className={`party-card ${selected === p.name ? "selected" : ""}`}
                style={{ borderColor: selected === p.name ? p.color : undefined }}
                onClick={() => setSelected(p.name)}
              >
                <div className="party-symbol">{p.symbol}</div>
                <div className="party-name">{p.name}</div>
                <div className="party-candidate">{p.candidate}</div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-gold"
            style={{ width: "100%", marginTop: "0.5rem" }}
            onClick={handleVote}
            disabled={!selected}
          >
            Review My Vote →
          </button>
        </div>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && selectedParty && (
        <div className="card animate-in" style={{ textAlign: "center" }}>
          <h2 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>Confirm Your Vote</h2>
          <div style={{
            background: "var(--surface-2)", borderRadius: "var(--radius-lg)",
            padding: "2rem", marginBottom: "2rem"
          }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>{selectedParty.symbol}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>{selectedParty.name}</div>
            <div style={{ color: "var(--text-muted)" }}>{selectedParty.candidate}</div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Once confirmed, your vote will be <strong style={{ color: "var(--text)" }}>permanently mined</strong> into
            the blockchain and cannot be changed.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep("ballot")}>
              ← Change Vote
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmVote} disabled={loading}>
              {loading ? <><span className="loader" /> Mining Block...</> : "✓ Confirm Vote"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && block && (
        <div className="card animate-in" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontWeight: 800, marginBottom: "0.5rem", color: "var(--success)" }}>
            Vote Recorded!
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Your vote has been successfully mined into Block #{block.index}
          </p>
          <div className="chain-block" style={{ textAlign: "left" }}>
            <div className="block-header">
              <span className="block-index">Block #{block.index}</span>
              <span className="valid-badge valid">✓ Mined</span>
            </div>
            <div className="block-hash">Hash: <span>{block.hash}</span></div>
            <div className="block-hash">Prev: <span>{block.previous_hash}</span></div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Party: <strong style={{ color: "var(--accent)" }}>{block.party}</strong> &nbsp;|&nbsp;
              Nonce: <strong style={{ color: "var(--gold)" }}>{block.nonce}</strong> &nbsp;|&nbsp;
              {new Date(block.timestamp).toLocaleString()}
            </div>
          </div>
          <button className="btn btn-gold" style={{ width: "100%", marginTop: "1.5rem" }} onClick={() => navigate("results")}>
            View Live Results →
          </button>
        </div>
      )}
    </div>
  );
}
