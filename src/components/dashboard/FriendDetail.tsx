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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto
                   rounded-t-3xl sm:rounded-3xl
                   bg-[#0b1220] border border-white/10
                   p-6 sm:p-8 shadow-2xl"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HEADER */}
        <div className="mb-6 flex items-center gap-4">
          <NameAvatar name={player.name} size="xl" />

          <div className="flex-1">
            <h2 className="text-2xl font-black text-white">
              {player.name}
            </h2>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="bg-gradient-primary px-3 py-1 rounded-full text-white font-semibold">
                {player.totalVotesReceived} votes
              </span>

              {player.titlesWon > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-semibold">
                  👑 {player.titlesWon} title{player.titlesWon > 1 ? "s" : ""}
                </span>
              )}

              <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full">
                MVP {player.mvpScore}%
              </span>
            </div>
          </div>
        </div>

        {/* CATEGORY */}
        <h3 className="mb-3 text-sm text-gray-400 font-semibold">
          Votes by category
        </h3>

        <div className="space-y-3">
          {sorted.map((c, i) => (
            <motion.div
              key={c.questionId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-white/10 bg-[#020617] p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{c.emoji ?? "✨"}</span>

                <span className="flex-1 text-sm text-white/90 truncate">
                  {c.questionText}
                </span>

                <span className="text-sm font-bold text-purple-400">
                  {c.votes}
                </span>
              </div>

              {/* PROGRESS */}
              <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.votes / max) * 100}%` }}
                  transition={{ duration: 0.7 }}
                  className="h-full bg-gradient-primary"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}