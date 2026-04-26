import { motion } from "framer-motion";
import type { QuestionResult } from "@/lib/types";
import { NameAvatar } from "../NameAvatar";

const tones = [
  { bg: "bg-gradient-primary", chip: "bg-primary/10 text-primary" },
  { bg: "bg-gradient-peach", chip: "bg-secondary/30 text-secondary-foreground" },
  { bg: "bg-gradient-mint", chip: "bg-accent/30 text-accent-foreground" },
  { bg: "bg-gradient-gold", chip: "bg-gold/20 text-gold-foreground" },
];

interface Props {
  results: QuestionResult[];
  onOpen: (id: string) => void;
}

export function AwardsTab({ results, onOpen }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {results.map((r, i) => {
        const top = r.ranking.slice(0, 3).filter((x) => x.votes > 0);
        const winner = top[0];
        const winners = r.ranking.filter((x) => x.isWinner);
        const isTie = winners.length > 1;
        const tone = tones[i % tones.length];

        return (
          <motion.button
            key={r.question.id}
            type="button"
            onClick={() => onOpen(r.question.id)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl border p-5 text-left shadow-soft transition hover:shadow-elevated"
          >
            {/* Decorative gradient orb */}
            <div
              className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-2xl ${tone.bg}`}
              aria-hidden
            />
            <div className="relative">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="text-3xl">{r.question.emoji ?? "✨"}</div>
                {isTie && (
                  <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-foreground">
                    Tie
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg font-bold leading-snug">{r.question.text}</h3>

              {/* Winner */}
              {winner && winner.votes > 0 ? (
                <div className="mt-4 rounded-2xl bg-gradient-primary p-3 text-primary-foreground shadow-glow">
                  <div className="flex items-center gap-3">
                    <NameAvatar name={winner.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80">
                        🏆 Winner
                      </div>
                      <div className="truncate font-display text-lg font-bold">{winner.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl font-black leading-none">{winner.percentage}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                        {winner.votes} votes
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                  No votes for this category
                </div>
              )}

              {/* Runners-up */}
              {top.length > 1 && (
                <div className="mt-3 space-y-1.5">
                  {top.slice(1).map((p, idx) => (
                    <div key={p.name} className="flex items-center gap-2 text-sm">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${tone.chip}`}>
                        {idx + 2}
                      </span>
                      <span className="flex-1 truncate text-foreground/80">{p.name}</span>
                      <span className="text-xs font-medium text-muted-foreground">{p.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
