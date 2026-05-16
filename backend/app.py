from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import json

from blockchain import Blockchain
from database import (
    init_db, register_voter, voter_exists, has_voted,
    record_vote, get_all_parties, get_vote_counts,
    get_total_registered, get_total_voted,
    save_chain_state, load_chain_state
)

app = Flask(__name__)
CORS(app)

# Initialize DB
init_db()

# Initialize or restore blockchain
blockchain = Blockchain()

def hash_voter_id(voter_id: str) -> str:
    return hashlib.sha256(voter_id.strip().lower().encode()).hexdigest()


# ─── ROUTES ────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "chain_valid": blockchain.is_chain_valid()})


@app.route("/api/parties", methods=["GET"])
def parties():
    data = get_all_parties()
    vote_counts = get_vote_counts()
    total = get_total_voted()
    for p in data:
        count = vote_counts.get(p["name"], 0)
        p["votes"] = count
        p["percentage"] = round(count / total * 100, 2) if total > 0 else 0
    return jsonify(data)


@app.route("/api/register", methods=["POST"])
def register():
    body = request.get_json()
    voter_id = body.get("voter_id", "").strip()
    name = body.get("name", "").strip()
    age = body.get("age", 0)

    if not voter_id or not name:
        return jsonify({"success": False, "message": "Voter ID and name are required"}), 400

    if int(age) < 18:
        return jsonify({"success": False, "message": "Must be 18+ to vote"}), 400

    if voter_exists(voter_id):
        return jsonify({"success": False, "message": "Voter ID already registered"}), 409

    voter_hash = hash_voter_id(voter_id)
    result = register_voter(voter_id, voter_hash, name, int(age))
    return jsonify(result)


@app.route("/api/vote", methods=["POST"])
def vote():
    body = request.get_json()
    voter_id = body.get("voter_id", "").strip()
    party = body.get("party", "").strip()

    if not voter_id or not party:
        return jsonify({"success": False, "message": "Voter ID and party are required"}), 400

    # if not voter_exists(voter_id):
    #     return jsonify({"success": False, "message": "Voter not registered. Please register first."}), 404

    voter_hash = hash_voter_id(voter_id)

    if has_voted(voter_hash):
        return jsonify({"success": False, "message": "You have already cast your vote"}), 409

    # Add to blockchain
    result = blockchain.add_vote(voter_id, party)
    if not result["success"]:
        return jsonify(result), 400

    block = result["block"]
    record_vote(voter_hash, party, block["index"], block["hash"])
    save_chain_state(json.dumps(blockchain.get_chain()))

    return jsonify({
        "success": True,
        "message": "Your vote has been recorded on the blockchain!",
        "block": block
    })


@app.route("/api/results", methods=["GET"])
def results():
    vote_counts = get_vote_counts()
    parties = get_all_parties()
    total = get_total_voted()

    results_data = []
    for p in parties:
        count = vote_counts.get(p["name"], 0)
        results_data.append({
            **p,
            "votes": count,
            "percentage": round(count / total * 100, 2) if total > 0 else 0
        })

    results_data.sort(key=lambda x: x["votes"], reverse=True)

    return jsonify({
        "results": results_data,
        "total_votes": total,
        "total_registered": get_total_registered(),
        "turnout": round(total / get_total_registered() * 100, 2) if get_total_registered() > 0 else 0,
        "chain_valid": blockchain.is_chain_valid()
    })


@app.route("/api/blockchain", methods=["GET"])
def get_blockchain():
    return jsonify({
        "chain": blockchain.get_chain(),
        "length": len(blockchain.chain),
        "is_valid": blockchain.is_chain_valid()
    })


@app.route("/api/verify/<voter_id>", methods=["GET"])
def verify_vote(voter_id):
    voter_hash = hash_voter_id(voter_id)
    voted = has_voted(voter_hash)
    return jsonify({
        "voter_id": voter_id,
        "has_voted": voted,
        "registered": voter_exists(voter_id)
    })


if __name__ == "__main__":
    import os

app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
