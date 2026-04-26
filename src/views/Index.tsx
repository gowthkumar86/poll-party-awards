"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { CompletedPollSummary } from "@/lib/types";

export default function Index() {
  const router = useRouter();
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
    router.push(dashboard ? `/dashboard/${clean}` : `/poll/${clean}`);
  };

  return (
    <div className="app-bg min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl space-y-10">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight">
            Poll Party Awards
          </h1>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-gray-400">
            Create polls, expose your friends 😂, and reveal the results.
          </p>
        </motion.header>

        {/* ACTION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-5 p-6"
        >
          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => router.push("/create")}
              className="h-11 rounded-xl bg-gradient-primary px-5 text-white font-semibold shadow-glow"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create poll
            </Button>

            <Button
              type="button"
              onClick={loadCompleted}
              disabled={loading}
              className="h-11 rounded-xl bg-[#0b1220] border border-white/10 text-gray-300 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">
              Open poll / dashboard
            </Label>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={pollIdInput}
                onChange={(e) => setPollIdInput(e.target.value)}
                placeholder="Paste poll id"
                className="h-11 rounded-xl bg-[#020617] border-white/10 text-white"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => openPoll(false)}
                  className="h-11 rounded-xl bg-[#0b1220] border border-white/10 text-gray-300"
                >
                  Open
                </Button>

                <Button
                  type="button"
                  onClick={() => openPoll(true)}
                  className="h-11 rounded-xl bg-gradient-primary text-white"
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COMPLETED POLLS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Completed Polls
            </h2>
            <span className="text-xs text-gray-400">
              {polls.length} found
            </span>
          </div>

          {polls.length === 0 ? (
            <div className="card p-5 text-sm text-gray-400 text-center">
              No completed polls yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {poll.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(poll.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => router.push(`/dashboard/${poll.id}`)}
                    className="rounded-xl bg-gradient-primary text-white"
                  >
                    View
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
