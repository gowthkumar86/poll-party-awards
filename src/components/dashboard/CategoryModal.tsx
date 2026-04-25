import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { QuestionResult } from "@/lib/types";
import { NameAvatar } from "../NameAvatar";

interface Props {
  result: QuestionResult;
  onClose: () => void;
}

const medal = ["🥇", "🥈", "🥉"];

export function CategoryModal({ result, onClose }: Props) {
  const { question, ranking, totalVotes } = result;
  const winners = ranking.filter((r) => r.isWinner);
  const tied = winners.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-background p-6 shadow-pop sm:rounded-3xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-foreground hover:text-background"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 text-center">
          <div className="mb-2 text-5xl">{question.emoji ?? "✨"}</div>
          <h2 className="font-display text-2xl font-black leading-tight">{question.text}</h2>
          <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span>{totalVotes} total votes</span>
            {tied && (
              <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-foreground">
                Tie!
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {ranking.map((r, i) => {
            const isWinner = r.isWinner;
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative overflow-hidden rounded-2xl border p-3 ${
                  isWinner
                    ? "border-primary/30 bg-gradient-to-r from-primary/10 to-tertiary/10"
                    : "border-border/40 bg-white/60"
                }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span className="w-8 text-center text-lg font-bold tabular-nums text-muted-foreground">
                    {i < 3 ? medal[i] : `#${r.rank}`}
                  </span>
                  <NameAvatar name={r.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate font-semibold ${isWinner ? "text-foreground" : ""}`}>{r.name}</span>
                      <span className="shrink-0 font-display text-base font-bold tabular-nums">
                        {r.percentage}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.15 + i * 0.05 }}
                        className={`h-full rounded-full ${isWinner ? "bg-gradient-primary" : "bg-foreground/30"}`}
                      />
                    </div>
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-medium text-muted-foreground">
                    {r.votes}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
