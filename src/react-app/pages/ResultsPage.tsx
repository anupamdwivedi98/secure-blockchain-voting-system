import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { RefreshCw, Users } from "lucide-react";

// interface Results {
//   A: number;
//   B: number;
//   C: number;
// }

export default function ResultsPage() {
  const [results, setResults] = useState<{ 
  name: string;
  votes: number;
  percentage: number;
  }[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/api/results");

    const data = await response.json();

    console.log(data);

    setResults(data.results || []);
    setTotalVotes(data.total_votes || 0);

  } catch (error) {
    console.error("Failed to fetch results:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchResults();
  }, []);

  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const getWinner = () => {
  if (results.length === 0) return null;

  const maxVotes = Math.max(
    ...results.map((c) => c.votes)
  );

  const winners = results.filter(
    (c) => c.votes === maxVotes
  );

  return winners.length === 1
    ? winners[0].name
    : null;
};

  const winner = getWinner();

  const candidateColors: Record<string, string> = {
  B: "bg-orange-500",
  C: "bg-blue-500",
  A: "bg-green-500",
  S: "bg-red-500",
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voting Results</h1>
          <p className="text-muted-foreground mt-1">Real-time vote counts from the blockchain</p>
        </div>
        <Button onClick={fetchResults} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Total Votes</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-mono text-lg font-semibold text-foreground">{totalVotes}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {results.map((candidate) => {
          const count = candidate.votes;
          const percentage = getPercentage(count);
          const isWinner = winner === candidate.name;

          return (
            <Card
              key={candidate.name}
              className={`transition-all ${isWinner ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-14 h-14 rounded-lg ${candidateColors[candidate.name.charAt(0)]} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white font-bold text-xs">{candidate.name}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{candidate.name}</p>
                      {isWinner && (
                        <span className="text-xs text-primary font-medium">Leading</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono">{count}</p>
                    <p className="text-sm text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${candidateColors[candidate.name.charAt(0)]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
