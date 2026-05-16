import hashlib
import json
import datetime
from typing import Optional


class Block:
    def __init__(self, index: int, voter_hash: str, party: str, previous_hash: str, timestamp: Optional[str] = None):
        self.index = index
        self.timestamp = timestamp or str(datetime.datetime.utcnow().isoformat())
        self.voter_hash = voter_hash  # hashed voter ID for privacy
        self.party = party
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self) -> str:
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "voter_hash": self.voter_hash,
            "party": self.party,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty: int = 2):
        """Proof of Work - find hash starting with `difficulty` zeros"""
        target = "0" * difficulty
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self.calculate_hash()

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "voter_hash": self.voter_hash,
            "party": self.party,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "nonce": self.nonce,
            "voter_id": self.voter_hash,
        }


class Blockchain:
    DIFFICULTY = 2

    def __init__(self):
        self.chain: list[Block] = []
        self.voted_hashes: set = set()
        self._create_genesis_block()

    def _hash_voter(self, voter_id: str) -> str:
        return hashlib.sha256(voter_id.strip().lower().encode()).hexdigest()

    def _create_genesis_block(self):
        genesis = Block(0, "GENESIS", "SYSTEM", "0", "2024-01-01T00:00:00")
        genesis.mine_block(self.DIFFICULTY)
        self.chain.append(genesis)

    def add_vote(self, voter_id: str, party: str) -> dict:
        voter_hash = self._hash_voter(voter_id)

        if voter_hash in self.voted_hashes:
            return {"success": False, "message": "Voter has already voted"}

        prev_block = self.chain[-1]
        new_block = Block(
            index=len(self.chain),
            voter_hash=voter_hash,
            party=party,
            previous_hash=prev_block.hash
        )
        new_block.mine_block(self.DIFFICULTY)
        self.chain.append(new_block)
        self.voted_hashes.add(voter_hash)

        return {
            "success": True,
            "message": "Vote recorded on blockchain",
            "block": new_block.to_dict()
        }

    def get_results(self) -> dict:
        results = {}
        for block in self.chain[1:]:  # skip genesis
            results[block.party] = results.get(block.party, 0) + 1
        return results

    def get_chain(self) -> list:
        return [block.to_dict() for block in self.chain]

    def is_chain_valid(self) -> bool:
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]
            if curr.hash != curr.calculate_hash():
                return False
            if curr.previous_hash != prev.hash:
                return False
        return True

    def get_stats(self) -> dict:
        results = self.get_results()
        total = sum(results.values())
        return {
            "total_votes": total,
            "results": results,
            "chain_length": len(self.chain),
            "is_valid": self.is_chain_valid(),
            "percentages": {
                party: round((count / total * 100), 2) if total > 0 else 0
                for party, count in results.items()
            }
        }
