import { useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { CheckCircle2, AlertCircle, User } from "lucide-react";
// import { blockchain } from "../blockchain";

export default function VotePage() {
  const [voterId, setVoterId] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (candidate: string) => {
    if (!voterId.trim()) {
      setStatus({ type: "error", message: "Please enter your Voter ID" });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("http://127.0.0.1:5000/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: voterId.trim(), party: candidate }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: `Vote recorded successfully! Block #${data.block.index} created.`,
        });
        setVoterId("");
      } else {
        setStatus({ type: "error", message: data.error });
      }
    } catch {
      setStatus({ type: "error", message: "Failed to submit vote. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cast Your Vote</h1>
        <p className="text-muted-foreground mt-1">
          Each vote is stored as an immutable block on the chain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voter Identification</CardTitle>
          <CardDescription>Enter your unique voter ID to proceed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your Voter ID"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Candidate</CardTitle>
          <CardDescription>Choose one of the candidates below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {["BJP", "Congress", "AAP", "SP", "BSP"].map((candidate) => (
              <Button
                key={candidate}
                onClick={() => handleVote(candidate)}
                disabled={isSubmitting}
                variant="outline"
                className="h-24 text-2xl font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                {candidate}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {status.type && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="font-medium">{status.message}</p>
        </div>
      )}
    </div>
  );
}
