import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { PlayerStats } from "@/lib/types";
import { NameAvatar } from "../NameAvatar";

interface Props {
  player: PlayerStats;
  onClose: () => void;
}

export function FriendDetail({ player, onClose }: Props) {
  const sorted = [...player.perCategory].sort((a, b) => b.votes - a.votes);
  const max = Math.max(1, ...sorted.map((c) => c.votes));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center sm:p-6"
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

        <div className="mb-6 flex items-center gap-4">
          <NameAvatar name={player.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-black leading-tight">{player.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-gradient-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                {player.totalVotesReceived} votes
              </span>
              {player.titlesWon > 0 && (
                <span className="rounded-full bg-gradient-gold px-2.5 py-0.5 text-[11px] font-bold text-gold-foreground">
                  👑 {player.titlesWon} title{player.titlesWon > 1 ? "s" : ""}
                </span>
              )}
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                MVP {player.mvpScore}%
              </span>
            </div>
          </div>
        </div>

        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Votes by category</h3>
        <div className="space-y-2.5">
          {sorted.map((c, i) => (
            <motion.div
              key={c.questionId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-border/40 bg-white/60 p-3"
            >
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-base">{c.emoji ?? "✨"}</span>
                <span className="flex-1 truncate text-sm font-medium">{c.questionText}</span>
                <span className="shrink-0 font-display text-sm font-bold tabular-nums">{c.votes}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.votes / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.03 }}
                  className="h-full rounded-full bg-gradient-primary"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
