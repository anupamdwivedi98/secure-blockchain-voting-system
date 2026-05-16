class Block {
  index: number;
  timestamp: string;
  vote: string;
  previousHash: string;
  hash: string;

  constructor(index: number, timestamp: string, vote: string, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.vote = vote;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return btoa(this.index + this.timestamp + this.vote + this.previousHash);
  }
}

class Blockchain {
  chain: Block[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock(): Block {
    return new Block(0, new Date().toISOString(), "Genesis", "0");
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(vote: string) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      vote,
      this.getLatestBlock().hash
    );
    this.chain.push(newBlock);
  }
}

export const blockchain = new Blockchain();