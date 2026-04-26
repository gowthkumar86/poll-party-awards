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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl
                   bg-[#0b1220] border border-white/10 p-6 sm:p-8 shadow-2xl"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HEADER */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-5xl">{question.emoji ?? "✨"}</div>

          <h2 className="text-2xl font-black text-white">
            {question.text}
          </h2>

          <div className="mt-2 text-xs text-gray-400">
            {totalVotes} votes {tied && <span className="text-yellow-400 ml-2">Tie!</span>}
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {ranking.map((r, i) => {
            const isWinner = r.isWinner;

            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border p-3 ${
                  isWinner
                    ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500/30"
                    : "bg-[#020617] border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-lg">
                    {i < 3 ? medal[i] : `#${r.rank}`}
                  </span>

                  <NameAvatar name={r.name} size="sm" />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">
                        {r.name}
                      </span>

                      <span className="font-bold text-purple-400">
                        {r.percentage}%
                      </span>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-1.5 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className={isWinner ? "bg-gradient-primary h-full" : "bg-white/30 h-full"}
                      />
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 w-8 text-right">
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