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
    <div className="app-bg min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl space-y-10">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0b1220] border border-white/10 px-4 py-1.5 text-xs text-gray-400">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            Anonymous awards
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-tight text-white">
            Crown the <span className="gradient-text italic">chaos</span>
          </h1>

          <p className="text-gray-400 max-w-md mx-auto">
            Drop a poll in your group and let the chaos unfold 😂
          </p>
        </motion.div>

        {/* FORM */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-7 p-6 sm:p-8"
        >

          {/* TITLE */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Poll title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Squad Awards"
              className="h-12 rounded-xl bg-[#020617] border-white/10 text-white"
            />
          </div>

          {/* QUESTIONS */}
          <div className="space-y-4">
            <Label className="text-sm text-gray-400">Questions</Label>

            {questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={q.emoji}
                  onChange={(e) => updateQuestion(i, { emoji: e.target.value })}
                  className="h-12 w-14 rounded-xl bg-[#020617] border-white/10 text-center text-xl"
                />

                <Input
                  value={q.text}
                  onChange={(e) => updateQuestion(i, { text: e.target.value })}
                  placeholder="Most likely to..."
                  className="h-12 flex-1 rounded-xl bg-[#020617] border-white/10 text-white"
                />

                {questions.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400"
                  >
                    <X />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={addQuestion}
              className="w-full h-11 rounded-xl bg-[#0b1220] border border-white/10 text-gray-400"
            >
              + Add question
            </Button>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTED_QUESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => setQuestions((q) => [...q, s])}
                  className="px-3 py-1 text-xs rounded-full bg-[#0b1220] border border-white/10 text-gray-300 hover:text-white"
                >
                  {s.emoji} {s.text}
                </button>
              ))}
            </div>
          </div>

          {/* PLAYERS */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Friends</Label>
            <textarea
              value={namesInput}
              onChange={(e) => setNamesInput(e.target.value)}
              placeholder="Arun, Karthik, Gowtham..."
              className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-[#020617] border-white/10 text-white"
            />
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-xl bg-gradient-primary text-white font-semibold shadow-glow"
          >
            {submitting ? "Creating..." : "Create poll"}
          </Button>

        </motion.form>
      </div>
    </div>
  );
}

