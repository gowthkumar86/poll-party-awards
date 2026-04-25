import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { CompletedPollSummary } from "@/lib/types";

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [polls, setPolls] = useState<CompletedPollSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [pollIdInput, setPollIdInput] = useState("");

  const loadCompleted = async () => {
    setLoading(true);
    try {
      const rows = await api.listCompletedPolls();
      setPolls(rows);
    } catch (error) {
      toast({
        title: "Couldn't load completed polls",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPoll = (dashboard: boolean) => {
    const clean = pollIdInput.trim();
    if (!clean) return;
    navigate(dashboard ? `/dashboard/${clean}` : `/poll/${clean}`);
  };

  return (
    <div className="min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 text-center"
        >
          <h1 className="font-display text-5xl font-black tracking-tight sm:text-6xl">Poll Party Awards</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Create new polls, jump into an existing poll, or open dashboards for completed polls.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card-strong space-y-4 p-5 sm:p-6"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => navigate("/create")}
              className="h-11 rounded-2xl bg-gradient-primary px-5 font-semibold text-primary-foreground shadow-glow"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create new poll
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={loadCompleted}
              disabled={loading}
              className="h-11 rounded-2xl bg-white/80"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> {loading ? "Refreshing..." : "Refresh completed polls"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="poll-id-input">Open an existing poll/dashboard by ID</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="poll-id-input"
                value={pollIdInput}
                onChange={(e) => setPollIdInput(e.target.value)}
                placeholder="Paste poll id"
                className="h-11 rounded-2xl bg-white/80"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => openPoll(false)} className="h-11 rounded-2xl">
                  Open poll
                </Button>
                <Button type="button" onClick={() => openPoll(true)} className="h-11 rounded-2xl">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" /> Open dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Completed Poll Dashboards</h2>
            <span className="text-xs text-muted-foreground">{polls.length} found</span>
          </div>

          {polls.length === 0 ? (
            <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
              No completed polls yet. Close a poll to see its dashboard listed here.
            </div>
          ) : (
            <div className="grid gap-3">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{poll.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(poll.createdAt).toLocaleString()} • {poll.id}
                    </p>
                  </div>
                  <Button type="button" onClick={() => navigate(`/dashboard/${poll.id}`)} className="rounded-2xl">
                    View dashboard
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
