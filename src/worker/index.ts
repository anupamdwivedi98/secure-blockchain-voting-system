import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Types
interface Block {
  index: number;
  timestamp: string;
  voter: string;
  vote: string;
  previousHash: string;
  hash: string;
}

// In-memory blockchain storage (resets on worker restart)
let blockchain: Block[] = [];
let voters: Set<string> = new Set();

// Simple hash function using Web Crypto API
async function calculateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Create genesis block if chain is empty
async function ensureGenesisBlock() {
  if (blockchain.length === 0) {
    const genesisBlock: Block = {
      index: 0,
      timestamp: new Date().toISOString(),
      voter: "GENESIS",
      vote: "GENESIS",
      previousHash: "0",
      hash: "",
    };
    genesisBlock.hash = await calculateHash(
      `${genesisBlock.index}${genesisBlock.timestamp}${genesisBlock.voter}${genesisBlock.vote}${genesisBlock.previousHash}`
    );
    blockchain.push(genesisBlock);
  }
}

// Create a new block
async function createBlock(voter: string, vote: string): Promise<Block> {
  await ensureGenesisBlock();
  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock: Block = {
    index: previousBlock.index + 1,
    timestamp: new Date().toISOString(),
    voter,
    vote,
    previousHash: previousBlock.hash,
    hash: "",
  };
  newBlock.hash = await calculateHash(
    `${newBlock.index}${newBlock.timestamp}${newBlock.voter}${newBlock.vote}${newBlock.previousHash}`
  );
  return newBlock;
}

// Validate the blockchain
async function validateChain(): Promise<{ valid: boolean; errors: string[] }> {
  await ensureGenesisBlock();
  const errors: string[] = [];

  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    // Check if previous hash matches
    if (currentBlock.previousHash !== previousBlock.hash) {
      errors.push(`Block ${i}: Previous hash mismatch`);
    }

    // Verify current block's hash
    const expectedHash = await calculateHash(
      `${currentBlock.index}${currentBlock.timestamp}${currentBlock.voter}${currentBlock.vote}${currentBlock.previousHash}`
    );
    if (currentBlock.hash !== expectedHash) {
      errors.push(`Block ${i}: Hash verification failed`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Cast a vote
app.post("/api/vote", async (c) => {
  const { voterId, candidate } = await c.req.json();

  if (!voterId || !candidate) {
    return c.json({ error: "Voter ID and candidate are required" }, 400);
  }

  if (!["A", "B", "C"].includes(candidate)) {
    return c.json({ error: "Invalid candidate. Choose A, B, or C" }, 400);
  }

  if (voters.has(voterId)) {
    return c.json({ error: "This voter has already voted" }, 400);
  }

  const newBlock = await createBlock(voterId, candidate);
  blockchain.push(newBlock);
  voters.add(voterId);

  return c.json({ success: true, block: newBlock });
});

// Get vote results
app.get("/api/results", async (c) => {
  await ensureGenesisBlock();
  const results = { A: 0, B: 0, C: 0 };

  for (const block of blockchain) {
    if (block.vote === "A") results.A++;
    else if (block.vote === "B") results.B++;
    else if (block.vote === "C") results.C++;
  }

  return c.json({ results, totalVotes: blockchain.length - 1 });
});

// Get full blockchain
app.get("/api/blockchain", async (c) => {
  await ensureGenesisBlock();
  return c.json({ blockchain, totalBlocks: blockchain.length });
});

// Validate blockchain
app.get("/api/validate", async (c) => {
  const validation = await validateChain();
  return c.json(validation);
});

// Check if voter has voted
app.get("/api/check-voter/:voterId", async (c) => {
  const voterId = c.req.param("voterId");
  return c.json({ hasVoted: voters.has(voterId) });
});

// Reset blockchain (for demo purposes)
app.post("/api/reset", async (c) => {
  blockchain = [];
  voters = new Set();
  await ensureGenesisBlock();
  return c.json({ success: true, message: "Blockchain reset" });
});

export default app;
