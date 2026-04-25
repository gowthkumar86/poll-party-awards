import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { id = "" } = useParams();
  const navigate = useNavigate();
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
        navigate(`/dashboard/${id}`);
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
    navigate(`/poll/${id}/vote`);
  };

  const closePollWithPassword = async (closePasswordInput: string) => {
    setClosing(true);
    try {
      await api.closePoll(id, closePasswordInput);
      setShowCloseConfirm(false);
      setClosePassword("");
      navigate(`/dashboard/${id}`);
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
    <div className="min-h-screen px-5 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl space-y-7">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-white/80">
            <Sparkles className="h-3 w-3 text-primary" /> Active poll
          </div>
          <h1 className="font-display text-4xl font-black leading-tight sm:text-5xl">{bundle.poll.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bundle.questions.length} questions · {bundle.players.length} friends invited
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card flex items-center gap-3 p-3"
        >
          <div className="flex-1 truncate rounded-2xl bg-white/70 px-4 py-3 font-mono text-xs text-muted-foreground">
            {window.location.href}
          </div>
          <Button
            type="button"
            onClick={copyLink}
            className="h-12 shrink-0 rounded-2xl bg-foreground/90 px-4 font-semibold text-background hover:bg-foreground"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Share"}</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-strong p-6"
        >
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm font-semibold">Votes in</span>
            <span className="font-display text-2xl font-bold tabular-nums">
              {submittedCount}<span className="text-muted-foreground">/{total}</span>
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-primary"
            />
          </div>
        </motion.div>

        <div>
          <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">Who are you?</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                  className={`group relative flex flex-col items-center gap-2 rounded-3xl border p-4 text-center transition ${
                    p.hasSubmitted
                      ? "cursor-not-allowed border-border/40 bg-muted/40 opacity-60"
                      : "border-white/70 bg-white/80 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
                  }`}
                >
                  <NameAvatar name={p.name} size="md" />
                  <span className="text-sm font-semibold">{p.name}</span>
                  {p.hasSubmitted ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-foreground/70">
                      voted
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 group-hover:text-primary">
                      tap to vote
                    </span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="pt-2 text-center">
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
                className="rounded-2xl text-muted-foreground hover:bg-white/60 hover:text-foreground"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Close poll & reveal results
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">Host only - password required to close.</p>
            </>
          ) : (
            <form onSubmit={confirmClose} className="glass-card mx-auto max-w-sm space-y-3 p-4 text-left">
              <Label htmlFor="close-poll-password">Enter password to close this poll</Label>
              <Input
                id="close-poll-password"
                type="password"
                value={closePassword}
                onChange={(e) => setClosePassword(e.target.value)}
                className="h-11 rounded-2xl bg-white/80"
                placeholder="Group password"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCloseConfirm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={closing} className="flex-1">
                  {closing ? "Closing..." : "Confirm close"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
