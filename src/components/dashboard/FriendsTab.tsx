import { motion } from "framer-motion";
import type { PlayerStats } from "@/lib/types";
import { NameAvatar } from "../NameAvatar";

interface Props {
  players: PlayerStats[];
  onOpen: (name: string) => void;
}

export function FriendsTab({ players, onOpen }: Props) {
  const sorted = [...players].sort((a, b) => b.totalVotesReceived - a.totalVotesReceived);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sorted.map((p, i) => (
        <motion.button
          key={p.name}
          type="button"
          onClick={() => onOpen(p.name)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ y: -3 }}
          className="group flex flex-col items-center rounded-3xl border border-white/70 bg-white/80 p-4 text-center shadow-soft transition hover:shadow-elevated"
        >
          <NameAvatar name={p.name} size="lg" />
          <h3 className="mt-3 font-display text-base font-bold">{p.name}</h3>
          <div className="mt-1 text-xs font-medium text-muted-foreground">{p.totalVotesReceived} votes</div>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {p.titlesWon > 0 && (
              <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                👑 {p.titlesWon}
              </span>
            )}
            {p.mvpScore > 30 && (
              <span className="rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                🔥 {p.mvpScore}%
              </span>
            )}
            {p.totalVotesReceived === 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                😶 ghost
              </span>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
