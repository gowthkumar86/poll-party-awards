"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles, Users, MessageSquareQuote, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, session } from "@/lib/api";

const SUGGESTED_QUESTIONS = [
  { emoji: "😂", text: "Most likely to text their ex at 3am" },
  { emoji: "👑", text: "Born to be the main character" },
  { emoji: "🧠", text: "The unofficial group therapist" },
  { emoji: "🔥", text: "Would survive a reality TV show" },
  { emoji: "😴", text: "First to fall asleep at the party" },
  { emoji: "💸", text: "Most likely to start a cult (and succeed)" },
];

export default function CreatePoll() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<{ emoji: string; text: string }[]>([
    { emoji: "😂", text: "" },
  ]);
  const [namesInput, setNamesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const playerNames = namesInput
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const addQuestion = () => setQuestions((q) => [...q, { emoji: "✨", text: "" }]);
  const removeQuestion = (i: number) => setQuestions((q) => q.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, patch: Partial<{ emoji: string; text: string }>) =>
    setQuestions((q) => q.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));


  const redirectToPoll = (id: string) => {
    router.push(`/poll/${id}`);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cleaned = questions.filter((q) => q.text.trim());
      const { id } = await api.createPoll({
        title,
        password,
        questions: cleaned,
        playerNames,
      });
      session.save(id, { password });
      toast({ title: "Poll created ✨", description: "Share the link in your group chat!" });
      redirectToPoll(id);
    } catch (err) {
      toast({
        title: "Couldn't create poll",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md ring-1 ring-white/80">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Anonymous awards for your group chat
          </div>
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
            Crown the <span className="gradient-text italic">chaos</span>
            <br />in your friend group.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Build a poll, drop the link in WhatsApp, and watch your friends vote on each other anonymously.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card-strong space-y-7 p-6 sm:p-8"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Poll title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Squad Awards 2026"
              className="h-12 rounded-2xl border-border/60 bg-white/80 text-base"
              required
            />
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareQuote className="h-4 w-4 text-primary" /> Questions
            </Label>
            <AnimatePresence initial={false}>
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2">
                    <Input
                      value={q.emoji}
                      onChange={(e) => updateQuestion(i, { emoji: e.target.value })}
                      className="h-12 w-14 rounded-2xl border-border/60 bg-white/80 px-0 text-center text-xl"
                      maxLength={2}
                    />
                    <Input
                      value={q.text}
                      onChange={(e) => updateQuestion(i, { text: e.target.value })}
                      placeholder="Most likely to..."
                      className="h-12 flex-1 rounded-2xl border-border/60 bg-white/80"
                    />
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(i)}
                        className="h-12 w-12 shrink-0 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              type="button"
              variant="ghost"
              onClick={addQuestion}
              className="h-11 w-full rounded-2xl border border-dashed border-border bg-white/40 font-medium text-muted-foreground hover:bg-white/70 hover:text-foreground"
            >
              <Plus className="mr-1 h-4 w-4" /> Add question
            </Button>

            {/* Suggestions */}
            <div className="pt-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Need ideas? Tap to add:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((s) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => setQuestions((q) => [...q, s])}
                    className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground/80 ring-1 ring-border/60 transition hover:bg-gradient-primary hover:text-primary-foreground hover:shadow-glow hover:ring-transparent"
                  >
                    {s.emoji} {s.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="space-y-2">
            <Label htmlFor="names" className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" /> Friends
              {playerNames.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {playerNames.length}
                </span>
              )}
            </Label>
            <textarea
              id="names"
              value={namesInput}
              onChange={(e) => setNamesInput(e.target.value)}
              placeholder="Aria, Theo, Kai, Lena, Marcus..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-border/60 bg-white/80 px-4 py-3 text-base outline-none ring-ring/0 transition focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-xs text-muted-foreground">
              Separate with commas or new lines. These are the only names that can vote — and the only options to vote
              for.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-primary" /> Group password
            </Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="something only the group knows"
              className="h-12 rounded-2xl border-border/60 bg-white/80 text-base"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow transition hover:shadow-pop disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create poll →"}
          </Button>
        </motion.form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Frontend prototype · data stored locally in this browser · backend swappable
        </p>
      </div>
    </div>
  );
}

