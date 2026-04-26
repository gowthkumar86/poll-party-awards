"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Copy, Check, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, session } from "@/lib/api";
import type { PollBundle } from "@/lib/types";
import { NameAvatar } from "@/components/NameAvatar";

export default function PollLobby() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [bundle, setBundle] = useState<PollBundle | null>(null);
  const [password, setPassword] = useState(session.load(id)?.password ?? "");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closePassword, setClosePassword] = useState("");

  useEffect(() => {
    const saved = session.load(id)?.password;
    if (saved) tryUnlock(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function tryUnlock(pw: string) {
    setLoading(true);
    try {
      const data = await api.getPoll(id, pw);
      setBundle(data);
      setAuthed(true);
      session.save(id, { password: pw, voterName: session.load(id)?.voterName });
      if (data.poll.status === "closed") {
        router.push(`/dashboard/${id}`);
      }
    } catch (err) {
      toast({
        title: "Couldn't open poll",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    tryUnlock(password);
  };

  const handlePickName = (name: string, hasSubmitted: boolean) => {
    if (hasSubmitted) return;
    session.save(id, { password, voterName: name });
    router.push(`/poll/${id}/vote`);
  };

  const closePollWithPassword = async (closePasswordInput: string) => {
    setClosing(true);
    try {
      await api.closePoll(id, closePasswordInput);
      setShowCloseConfirm(false);
      setClosePassword("");
      router.push(`/dashboard/${id}`);
    } catch (err) {
      toast({
        title: "Couldn't close",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setClosing(false);
    }
  };

  const confirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = closePassword.trim();
    if (!cleanPassword) {
      toast({
        title: "Password required",
        description: "Enter poll password to close this poll.",
        variant: "destructive",
      });
      return;
    }

    await closePollWithPassword(cleanPassword);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <motion.form
          onSubmit={handleUnlock}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong w-full max-w-sm space-y-5 p-7 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Private poll</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter the group password to join.</p>
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="pw">Password</Label>
            <Input
              id="pw"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl bg-white/80"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow"
          >
            {loading ? "Checking..." : "Unlock"}
          </Button>
        </motion.form>
      </div>
    );
  }

  if (!bundle) return null;

  const submittedCount = bundle.players.filter((p) => p.hasSubmitted).length;
  const total = bundle.players.length;
  const pct = total ? Math.round((submittedCount / total) * 100) : 0;

  return (
    <div className="app-bg min-h-screen px-5 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl space-y-8">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0b1220] border border-white/10 px-3 py-1 text-xs text-gray-400">
            <Sparkles className="h-3 w-3 text-purple-400" />
            Active poll
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            {bundle.poll.title}
          </h1>

          <p className="text-sm text-gray-400">
            {bundle.questions.length} questions • {bundle.players.length} friends
          </p>
        </motion.header>

        {/* SHARE LINK */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex items-center gap-3 p-3"
        >
          <div className="flex-1 truncate rounded-xl bg-[#020617] px-4 py-3 text-xs text-gray-400 font-mono">
            {typeof window !== "undefined" ? window.location.href : ""}
          </div>

          <Button
            type="button"
            onClick={copyLink}
            className="h-11 rounded-xl bg-gradient-primary text-white px-4 shadow-glow"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </motion.div>

        {/* PROGRESS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400 font-semibold">Votes in</span>
            <span className="text-2xl font-bold text-white">
              {submittedCount}
              <span className="text-gray-500">/{total}</span>
            </span>
          </div>

          <div className="h-3 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-primary"
            />
          </div>
        </motion.div>

        {/* PLAYER GRID */}
        <div>
          <h2 className="mb-4 text-sm text-gray-400 font-semibold px-1">
            Who are you?
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <AnimatePresence>
              {bundle.players.map((p, idx) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  type="button"
                  disabled={p.hasSubmitted}
                  onClick={() => handlePickName(p.name, p.hasSubmitted)}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 transition ${
                    p.hasSubmitted
                      ? "bg-[#020617] border-white/10 opacity-40 cursor-not-allowed"
                      : "bg-[#0b1220] border-white/10 hover:border-purple-500 hover:-translate-y-1"
                  }`}
                >
                  <NameAvatar name={p.name} size="md" />

                  <span className="text-sm font-semibold text-white">
                    {p.name}
                  </span>

                  {p.hasSubmitted ? (
                    <span className="text-xs text-gray-500 font-bold uppercase">
                      voted
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 group-hover:text-purple-400">
                      tap to vote
                    </span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* CLOSE POLL */}
        <div className="text-center pt-4">
          {!showCloseConfirm ? (
            <>
              <Button
                type="button"
                onClick={() => {
                  setShowCloseConfirm(true);
                  setClosePassword("");
                }}
                disabled={closing}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Close poll & reveal results
              </Button>

              <p className="text-xs text-gray-500 mt-1">
                Host only — password required
              </p>
            </>
          ) : (
            <form
              onSubmit={confirmClose}
              className="card mx-auto max-w-sm space-y-4 p-4 text-left"
            >
              <Label>Enter password</Label>

              <Input
                type="password"
                value={closePassword}
                onChange={(e) => setClosePassword(e.target.value)}
                className="bg-[#020617] border-white/10 text-white"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={closing} className="flex-1">
                  {closing ? "Closing..." : "Confirm"}
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );}
