import { motion } from "framer-motion";
import type { DashboardData } from "@/lib/types";
import { NameAvatar } from "../NameAvatar";

interface Props {
  data: DashboardData;
  onOpenCategory: (id: string) => void;
}

const medals = ["🥇", "🥈", "🥉"];

function InsightCard({
  emoji,
  label,
  value,
  detail,
  tone,
}: {
  emoji: string;
  label: string;
  value: string;
  detail?: string;
  tone: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft`}
    >
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-xl ${tone}`} aria-hidden />
      <div className="relative">
        <div className="text-2xl">{emoji}</div>
        <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate font-display text-xl font-black">{value}</div>
        {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
      </div>
    </motion.div>
  );
}

export function StatsTab({ data, onOpenCategory }: Props) {
  const sorted = [...data.players].sort((a, b) => b.totalVotesReceived - a.totalVotesReceived);
  const max = Math.max(1, sorted[0]?.totalVotesReceived ?? 1);
  const i = data.insights;

  return (
    <div className="space-y-8">
      {/* Leaderboard */}
      <section>
        <h3 className="mb-3 px-1 font-display text-xl font-bold">🏁 Leaderboard</h3>
        <div className="glass-card-strong space-y-2 p-4">
          {sorted.map((p, idx) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center gap-3 rounded-2xl p-2"
            >
              <span className="w-7 text-center font-display text-lg font-bold tabular-nums text-muted-foreground">
                {idx < 3 ? medals[idx] : idx + 1}
              </span>
              <NameAvatar name={p.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="font-display text-sm font-bold tabular-nums">{p.totalVotesReceived}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.totalVotesReceived / max) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.1 + idx * 0.04 }}
                    className={`h-full rounded-full ${idx === 0 ? "bg-gradient-primary" : "bg-foreground/40"}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Insights */}
      <section>
        <h3 className="mb-3 px-1 font-display text-xl font-bold">✨ Fun insights</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {i.mostTargeted && (
            <InsightCard
              emoji="😂"
              label="Most targeted"
              value={i.mostTargeted.name}
              detail={`${i.mostTargeted.votes} votes`}
              tone="bg-gradient-peach"
            />
          )}
          {i.leastNoticed && (
            <InsightCard
              emoji="😶"
              label="Least noticed"
              value={i.leastNoticed.name}
              detail={`${i.leastNoticed.votes} votes`}
              tone="bg-gradient-mint"
            />
          )}
          {i.mostChaotic && (
            <InsightCard
              emoji="😈"
              label="Most chaotic"
              value={i.mostChaotic.name}
              detail="dominated a category"
              tone="bg-gradient-primary"
            />
          )}
          {i.fanFavorite && (
            <InsightCard
              emoji="❤️"
              label="Fan favorite"
              value={i.fanFavorite.name}
              detail="top 3 in the most categories"
              tone="bg-gradient-gold"
            />
          )}
          {i.mostTitles && (
            <InsightCard
              emoji="👑"
              label="Most titles"
              value={i.mostTitles.name}
              detail={`${i.mostTitles.titles} wins`}
              tone="bg-gradient-primary"
            />
          )}
          <InsightCard
            emoji="📝"
            label="Total responses"
            value={String(i.totalResponses)}
            detail={`${data.totals.questions} questions × ${data.totals.participants} friends`}
            tone="bg-gradient-mint"
          />
        </div>
      </section>

      {/* Category overview */}
      <section>
        <h3 className="mb-3 px-1 font-display text-xl font-bold">🏆 All categories</h3>
        <div className="space-y-2">
          {data.questions.map((q) => {
            const top = q.ranking.slice(0, 3).filter((r) => r.votes > 0);
            const tied = q.ranking.filter((r) => r.isWinner).length > 1;
            return (
              <button
                key={q.question.id}
                type="button"
                onClick={() => onOpenCategory(q.question.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="text-2xl">{q.question.emoji ?? "✨"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{q.question.text}</span>
                    {tied && (
                      <span className="rounded-full bg-gradient-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold-foreground">
                        Tie
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {top.map((p, idx) => (
                      <span key={p.name} className={idx === 0 ? "font-semibold text-foreground" : ""}>
                        {medals[idx]} {p.name}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">→</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
