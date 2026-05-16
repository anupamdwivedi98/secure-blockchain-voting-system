# ⛓ VoteChain — Blockchain Voting System

A full-stack, production-grade blockchain-based voting system for India's elections. Built with **Python + Flask** (backend), **React + Vite** (frontend), and **SQLite** (database). No Solidity. No Ethereum. Pure SHA-256 blockchain with Proof-of-Work.

---

## 📁 Project Structure

```
blockchain-voting/
├── backend/
│   ├── app.py              # Flask REST API (all routes)
│   ├── blockchain.py       # Core blockchain: Block, Blockchain classes
│   ├── database.py         # SQLite layer (voters, votes, parties)
│   ├── requirements.txt    # Python dependencies
│   └── votes.db            # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Root app with page routing
│   │   ├── App.css         # Global design system
│   │   ├── main.jsx        # React entry point
│   │   ├── components/
│   │   │   └── Navbar.jsx  # Top navigation bar
│   │   ├── pages/
│   │   │   ├── Home.jsx    # Landing page with live stats
│   │   │   ├── Register.jsx # Voter registration form
│   │   │   ├── Vote.jsx    # Ballot casting (multi-step)
│   │   │   ├── Results.jsx # Live election results + charts
│   │   │   └── Chain.jsx   # Blockchain explorer
│   │   └── utils/
│   │       └── api.js      # API client for all backend calls
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Setup & Run

### 1. Backend (Python)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
# → Running on http://localhost:5000
```

### 2. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| GET    | /api/health         | Server health + chain validity       |
| GET    | /api/parties        | All parties with live vote counts    |
| POST   | /api/register       | Register a new voter                 |
| POST   | /api/vote           | Cast a vote (mines a new block)      |
| GET    | /api/results        | Full election results + turnout      |
| GET    | /api/blockchain     | Full chain data for explorer         |
| GET    | /api/verify/:id     | Check if voter has voted             |

---

## ⛓ Blockchain Design

- **Algorithm**: SHA-256 cryptographic hashing
- **Consensus**: Proof of Work (difficulty = 2 leading zeros)
- **Privacy**: Voter IDs are SHA-256 hashed before any storage
- **Immutability**: Each block contains `previous_hash` — any tampering breaks the chain
- **Verification**: `is_chain_valid()` re-hashes every block and checks linkage

### Block Structure
```json
{
  "index": 1,
  "timestamp": "2024-01-15T10:30:00",
  "voter_hash": "sha256(voter_id)",
  "party": "BJP",
  "previous_hash": "0000abc...",
  "nonce": 142,
  "hash": "0000def..."
}
```

---

## 🗄 Database Schema

- **voters** — Registered voter IDs (hashed), names, ages
- **votes** — Cast votes with block index + hash references
- **parties** — Party metadata (name, symbol, color, candidate)
- **blockchain_state** — Persisted chain JSON for crash recovery

---

## 🎨 Tech Stack

| Layer      | Technology            |
|------------|-----------------------|
| Frontend   | React 18, Vite 5      |
| Styling    | Pure CSS (no Tailwind) |
| Backend    | Flask 3, Python 3.10+ |
| Database   | SQLite (via sqlite3)  |
| Blockchain | Custom SHA-256 + PoW  |
| Fonts      | Syne + Space Mono     |

---

## 🔐 Security Features

1. Voter ID hashing (SHA-256) — raw IDs never stored
2. Double-vote prevention at both DB and blockchain layer
3. Chain integrity verification on every read
4. Proof of Work mining prevents trivial block injection
5. CORS enabled for local development
