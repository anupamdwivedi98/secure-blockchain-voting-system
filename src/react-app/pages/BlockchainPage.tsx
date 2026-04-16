import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { RefreshCw, ShieldCheck, ShieldX, Hash, Clock, User, Vote, Link } from "lucide-react";

interface Block {
  index: number;
  timestamp: string;
  voter: string;
  vote: string;
  previousHash: string;
  hash: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export default function BlockchainPage() {
  const [blockchain, setBlockchain] = useState<Block[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  const fetchBlockchain = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/blockchain");
      const data = await response.json();
      setBlockchain(data.blockchain);
    } catch (error) {
      console.error("Failed to fetch blockchain:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateChain = async () => {
    setValidating(true);
    try {
      const response = await fetch("/api/validate");
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error("Failed to validate:", error);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    fetchBlockchain();
  }, []);

  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blockchain Explorer</h1>
          <p className="text-muted-foreground mt-1">
            View all blocks in the voting chain
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={validateChain} variant="outline" size="sm" disabled={validating}>
            <ShieldCheck className={`w-4 h-4 mr-2 ${validating ? "animate-pulse" : ""}`} />
            Validate
          </Button>
          <Button onClick={fetchBlockchain} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {validation && (
        <Card className={validation.valid ? "border-emerald-500/50" : "border-destructive/50"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {validation.valid ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-emerald-600">Chain Valid</p>
                    <p className="text-sm text-muted-foreground">
                      All {blockchain.length} blocks verified successfully
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldX className="w-6 h-6 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Chain Invalid</p>
                    <p className="text-sm text-muted-foreground">
                      {validation.errors.join(", ")}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {blockchain.map((block, idx) => (
          <Card key={block.index} className="overflow-hidden">
            <CardHeader className="bg-muted/50 py-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Block #{block.index}
                </span>
                {block.voter === "GENESIS" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Genesis Block
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Timestamp</p>
                    <p className="font-mono text-xs">
                      {new Date(block.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Voter</p>
                    <p className="font-mono text-xs">{block.voter}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Vote className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Vote</p>
                    <p className="font-mono text-xs font-semibold">
                      {block.vote === "GENESIS" ? "-" : `Candidate ${block.vote}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-start gap-2">
                  <Link className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs">Previous Hash</p>
                    <p className="font-mono text-xs truncate" title={block.previousHash}>
                      {truncateHash(block.previousHash)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs">Block Hash</p>
                    <p className="font-mono text-xs truncate text-primary" title={block.hash}>
                      {truncateHash(block.hash)}
                    </p>
                  </div>
                </div>
              </div>
              {idx < blockchain.length - 1 && (
                <div className="flex justify-center pt-2">
                  <div className="w-px h-6 bg-border" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {blockchain.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No blocks in the chain yet. Cast a vote to create the first block!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
