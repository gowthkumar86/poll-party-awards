"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Trophy, Users, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, session } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { useCountUp } from "@/hooks/use-count-up";
import { AwardsTab } from "@/components/dashboard/AwardsTab";
import { FriendsTab } from "@/components/dashboard/FriendsTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { CategoryModal } from "@/components/dashboard/CategoryModal";
import { FriendDetail } from "@/components/dashboard/FriendDetail";

type Tab = "awards" | "friends" | "stats";

const TABS: { key: Tab; label: string; icon: typeof Trophy }[] = [
  { key: "awards", label: "Awards", icon: Trophy },
  { key: "friends", label: "Friends", icon: Users },
  { key: "stats", label: "Stats", icon: BarChart3 },
];

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-[#0b1220] border border-white/10 p-4 text-center shadow-lg">
      <div className="text-3xl font-black text-purple-400">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState(session.load(id)?.password ?? "");
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<Tab>("awards");
  const [modalQ, setModalQ] = useState<string | null>(null);
  const [modalP, setModalP] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = session.load(id)?.password;
    if (saved) load(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load(pw: string) {
    setLoading(true);
    try {
      const d = await api.getDashboard(id, pw);
      setData(d);
      session.save(id, { password: pw, voterName: session.load(id)?.voterName });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("after poll closes")) {
        toast({ title: "Poll still active", description: "Results unlock when the host closes the poll." });
        router.push(`/poll/${id}`);
      } else {
        toast({ title: "Couldn't load", description: msg, variant: "destructive" });
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card w-full max-w-sm space-y-5 p-7 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Results locked</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter the group password to view the dashboard.</p>
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="pw">Password</Label>
            <Input
              id="pw"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl bg-white/5"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow"
          >
            {loading ? "Unlocking…" : "View results"}
          </Button>
        </motion.form>
      </div>
    );
  }

  const currentModalQ = modalQ ? data.questions.find((q) => q.question.id === modalQ) : null;
  const currentModalP = modalP ? data.players.find((p) => p.name === modalP) : null;

  return (
    <div className="app-bg min-h-screen px-5 pb-24 pt-10 sm:pt-14">
      <div className="mx-auto w-full max-w-3xl space-y-8">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-bold uppercase text-white shadow-glow">
            <Sparkles className="h-3 w-3" />
            Results are in
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white drop-shadow-[0_5px_30px_rgba(124,58,237,0.4)]">
            <span className="gradient-text italic">{data.poll.title}</span>
          </h1>
        </motion.header>

        {/* SUMMARY */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-primary opacity-20 blur-2xl rounded-xl"></div>

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard value={data.totals.participants} label="Friends" />
            <StatCard value={data.totals.questions} label="Categories" />
            <StatCard value={data.totals.responses} label="Votes" />
            <StatCard value={Math.round(data.totals.completionRate * 100)} label="% in" />
          </div>
        </div>

        {/* TABS */}
        <div>
          <div className="flex gap-2 p-1 bg-[#020617] border border-white/10 rounded-xl">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="tabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-primary shadow-glow"
                    />
                  )}

                  <span className="relative flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "awards" && <AwardsTab results={data.questions} onOpen={setModalQ} />}
            {tab === "friends" && <FriendsTab players={data.players} onOpen={setModalP} />}
            {tab === "stats" && <StatsTab data={data} onOpenCategory={setModalQ} />}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* MODALS */}
      <AnimatePresence>
        {currentModalQ && (
          <CategoryModal result={currentModalQ} onClose={() => setModalQ(null)} />
        )}
        {currentModalP && (
          <FriendDetail player={currentModalP} onClose={() => setModalP(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
