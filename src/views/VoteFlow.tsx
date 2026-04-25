"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, session } from "@/lib/api";
import type { PollBundle } from "@/lib/types";
import { NameAvatar } from "@/components/NameAvatar";

export default function VoteFlow() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const sess = session.load(id);
  const password = sess?.password ?? "";
  const voterName = sess?.voterName ?? "";

  const [bundle, setBundle] = useState<PollBundle | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!password || !voterName) {
      router.push(`/poll/${id}`);
      return;
    }
    api
      .getPoll(id, password)
      .then((b) => {
        const me = b.players.find((p) => p.name.toLowerCase() === voterName.toLowerCase());
        if (!me) throw new Error("Name not found");
        if (me.hasSubmitted) {
          toast({ title: "Already voted", description: "This name has already submitted." });
          router.push(`/poll/${id}`);
          return;
        }
        if (b.poll.status !== "active") {
          router.push(`/dashboard/${id}`);
          return;
        }
        setBundle(b);
      })
      .catch((err) =>
        toast({
          title: "Couldn't load",
          description: err instanceof Error ? err.message : "",
          variant: "destructive",
        }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const question = bundle?.questions[step];
  const total = bundle?.questions.length ?? 0;
  const isLast = step === total - 1;
  const currentAnswer = question ? answers[question.id] : undefined;

  const choices = useMemo(
    () => bundle?.players.filter((p) => p.name.toLowerCase() !== voterName.toLowerCase()) ?? [],
    [bundle, voterName],
  );

  const select = (name: string) => {
    if (!question) return;
    setAnswers((a) => ({ ...a, [question.id]: name }));
  };

  const next = () => {
    if (!currentAnswer) return;
    if (isLast) return submit();
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!bundle) return;
    setSubmitting(true);
    try {
      await api.submitVotes({ pollId: id, voterName, password, answers });
      toast({ title: "Locked in 🔒", description: "Your votes are anonymous." });
      router.push(`/poll/${id}`);
    } catch (err) {
      toast({
        title: "Couldn't submit",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!bundle || !question) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const progressPct = ((step + 1) / total) * 100;

  return (
    <div className="flex min-h-screen flex-col px-5 py-8">
      {/* Top bar */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Question <span className="text-foreground">{step + 1}</span> of {total}
          </span>
          <span className="rounded-full bg-white/70 px-2.5 py-1 ring-1 ring-white/80">
            voting as <span className="text-foreground">{voterName}</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-primary"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mx-auto mt-8 flex w-full max-w-2xl flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-7 text-center">
              <div className="mb-3 text-5xl">{question.emoji ?? "✨"}</div>
              <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">{question.text}</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {choices.map((c) => {
                const selected = currentAnswer === c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select(c.name)}
                    className={`relative flex flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition ${
                      selected
                        ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow"
                        : "border-white/70 bg-white/80 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
                    }`}
                  >
                    <NameAvatar name={c.name} size="md" className={selected ? "ring-white/80" : ""} />
                    <span className={`text-sm font-semibold ${selected ? "text-primary-foreground" : ""}`}>
                      {c.name}
                    </span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-soft"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-4 mx-auto mt-8 w-full max-w-2xl">
        <div className="glass-card flex items-center gap-3 p-2">
          <Button
            type="button"
            variant="ghost"
            onClick={prev}
            disabled={step === 0}
            className="h-12 flex-1 rounded-2xl text-muted-foreground disabled:opacity-40"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            type="button"
            onClick={next}
            disabled={!currentAnswer || submitting}
            className="h-12 flex-[2] rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {submitting ? "Submitting…" : isLast ? "Submit votes ✨" : "Next"}
            {!isLast && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
