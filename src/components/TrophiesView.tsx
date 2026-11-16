import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import type {
  DailyGoal,
  GamingTeam,
  PlayerProgress,
  ShopRarity,
} from "../types";
import {
  SECRET_MISSIONS,
  SHOP_ITEMS,
  TROPHIES,
  WEEKLY_CHALLENGES,
  getRankTitle,
} from "../data/games";

interface TrophiesViewProps {
  progress: PlayerProgress;
  dailyGoals: DailyGoal[];
  purchasedItemIds: string[];
  team: GamingTeam | null;
  onBuyShopItem: (itemId: string, costXp: number) => void;
}

type TrophiesSubTab = "trophies" | "secret" | "shop";

const RARITY_STYLES: Record<ShopRarity, string> = {
  Comune: "text-slate-300",
  Raro: "text-blue-400",
  Epico: "text-violet-300",
  Leggendario: "text-amber-400",
};

export const TrophiesView: React.FC<TrophiesViewProps> = ({
  progress,
  dailyGoals,
  purchasedItemIds,
  team,
  onBuyShopItem,
}) => {
  const [subTab, setSubTab] = useState<TrophiesSubTab>("trophies");

  const levelNumber = Math.floor(progress.xp / 150) + 1;
  const currentLevelXp = progress.xp % 150;
  const levelPct = Math.round((currentLevelXp / 150) * 100);
  const completedDailyCount = dailyGoals.filter((g) => g.completed).length;

  const getWeeklyValue = (metric: "workouts" | "matches" | "coach" | "minutes") => {
    switch (metric) {
      case "workouts":
        return progress.completedWorkoutsCount;
      case "matches":
        return progress.matchDiary.length;
      case "coach":
        return progress.coachMessagesCount;
      case "minutes":
        return progress.totalMinutes;
    }
  };

  const getSecretProgress = (
    metric:
      | "night_owl"
      | "coach_deep"
      | "replay_lab"
      | "team_player"
      | "zero_to_hero"
      | "multi_game"
  ) => {
    switch (metric) {
      case "coach_deep":
        return progress.coachMessagesCount;
      case "replay_lab":
        return progress.mediaAnalysesCount;
      case "team_player":
        return team ? 1 : 0;
      case "zero_to_hero":
        return progress.completedWorkoutsCount;
      case "multi_game":
        return Object.values(progress.gameMinutes).filter((m) => m > 0).length;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Trofei, Missioni Segrete e Negozio XP
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
            Guadagna XP reali allenandoti e sblocca badge, trofei e oggetti estetici
            senza mai spendere denaro reale.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F172A] border border-violet-500/40 px-5 py-3 shrink-0">
          <p className="text-xs text-slate-400">XP spendibili nel negozio</p>
          <p className="font-mono text-2xl font-extrabold tabular-nums text-violet-300">
            {progress.spendableXp} XP
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-[#0F172A] border border-white/10 p-2">
        <button
          type="button"
          onClick={() => setSubTab("trophies")}
          className={`min-h-[48px] flex-1 min-w-[140px] px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "trophies"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Trofei & Sfide
        </button>

        <button
          type="button"
          onClick={() => setSubTab("secret")}
          className={`min-h-[48px] flex-1 min-w-[140px] px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "secret"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Missioni Segrete
        </button>

        <button
          type="button"
          onClick={() => setSubTab("shop")}
          className={`min-h-[48px] flex-1 min-w-[140px] px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "shop"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Negozio XP (Gratis)
        </button>
      </div>

      {subTab === "trophies" && (
        <>
          {/* Grado & Streak */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-400">
                    Grado attuale · {getRankTitle(progress.xp)}
                  </p>
                  <h2 className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-white">
                    Livello {levelNumber}
                  </h2>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums text-violet-300">
                  {progress.xp} XP totali
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 tabular-nums">
                  <span>Progresso livello</span>
                  <span>{currentLevelXp} / 150 XP</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                    style={{ width: `${levelPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl bg-[#0F172A] border border-white/10 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Serie consecutiva</span>
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-white">
                {progress.streakDays} {progress.streakDays === 1 ? "giorno" : "giorni"}
              </p>
              <p className="text-xs text-slate-400">
                Obiettivi completati oggi: {completedDailyCount}/{dailyGoals.length}
              </p>
            </div>
          </section>

          {/* Sfide Settimanali */}
          <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
            <h2 className="text-2xl font-bold text-white">Sfide settimanali</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WEEKLY_CHALLENGES.map((ch) => {
                const curr = getWeeklyValue(ch.metric);
                const pct = Math.min(100, Math.round((curr / ch.target) * 100));
                const done = curr >= ch.target;
                return (
                  <div
                    key={ch.id}
                    className={`rounded-2xl border p-5 space-y-3 ${
                      done
                        ? "bg-[#112423] border-emerald-500/40"
                        : "bg-[#141E34] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-white text-lg">{ch.title}</h3>
                      <span className="font-mono text-xs font-bold tabular-nums text-violet-300">
                        +{ch.xpReward} XP
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{ch.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono tabular-nums text-slate-300">
                        <span>
                          {Math.min(curr, ch.target)} / {ch.target}
                        </span>
                        <span>{done ? "Completata" : `${pct}%`}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trofei & Badge */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Bacheca Trofei e Badge
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TROPHIES.map((tr) => {
                const status = tr.check(progress, completedDailyCount);
                return (
                  <div
                    key={tr.id}
                    className={`rounded-3xl border p-5 flex flex-col justify-between gap-4 ${
                      status.unlocked
                        ? "bg-[#15223D] border-blue-500/50"
                        : "bg-[#0F172A] border-white/10 opacity-85"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                            status.unlocked
                              ? "bg-blue-600 text-white"
                              : "bg-white/5 text-slate-500"
                          }`}
                        >
                          {status.unlocked ? (
                            <Award className="w-6 h-6" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`font-mono text-xs font-bold tabular-nums ${
                            status.unlocked ? "text-emerald-400" : "text-slate-400"
                          }`}
                        >
                          {status.current}/{status.target}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">{tr.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {tr.description}
                      </p>
                    </div>

                    <p
                      className={`text-xs font-bold ${
                        status.unlocked ? "text-violet-300" : "text-slate-500"
                      }`}
                    >
                      {status.unlocked
                        ? `Sbloccato · ${tr.rewardLabel}`
                        : `Ricompensa: ${tr.rewardLabel}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {subTab === "secret" && (
        <section className="space-y-5">
          <div className="rounded-3xl bg-[#0F172A] border border-violet-500/30 p-6">
            <h2 className="text-2xl font-bold text-white">
              Missioni Segrete e Sfide a Tempo
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-300">
              Obiettivi speciali e realistici che premiano la tua esplorazione di tutta la piattaforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECRET_MISSIONS.map((m) => {
              const curr = getSecretProgress(m.metric);
              const done = curr >= m.target;
              const pct = Math.min(100, Math.round((curr / m.target) * 100));
              return (
                <div
                  key={m.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between gap-4 ${
                    done
                      ? "bg-[#112423] border-emerald-500/40"
                      : "bg-[#0F172A] border-white/10"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-violet-300 inline-flex items-center gap-1.5">
                        {m.isTimed && <Clock className="w-3.5 h-3.5" />}
                        {m.isTimed ? m.expiresLabel : "Missione Segreta"}
                      </span>
                      <span className="font-mono text-blue-400 tabular-nums">
                        +{m.rewardXp} XP
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{m.title}</h3>
                    <p className="text-sm text-slate-300">{m.hint}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono tabular-nums text-slate-300">
                      <span>
                        {Math.min(curr, m.target)}/{m.target}
                      </span>
                      <span>
                        {done ? `Sbloccato: ${m.badgeName}` : `${pct}%`}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {subTab === "shop" && (
        <section className="space-y-6">
          <div className="rounded-3xl bg-[#0F172A] border border-emerald-500/30 p-6 space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Negozio Cosmetici · XP Gratis & Opzioni Estetiche
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Tutti gli allenamenti, i tornei e le funzioni principali restano{" "}
              <strong className="text-white">100% gratuiti</strong>. Qui trovi
              solo elementi estetici (skin, avatar, cornici, sfondi e badge): nessun
              potenziamento, nessun acquisto di XP, nessun vantaggio competitivo.
            </p>
          </div>

          {/* 1. Cosmetici sbloccabili gratis con XP */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">
              1. Sblocca gratis con i tuoi XP
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SHOP_ITEMS.map((item) => {
                const owned = purchasedItemIds.includes(item.id);
                const canAfford = progress.spendableXp >= item.costXp;

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl border p-5 flex flex-col justify-between gap-4 ${
                      owned
                        ? "bg-[#15223D] border-emerald-500/40"
                        : "bg-[#0F172A] border-white/10"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={RARITY_STYLES[item.rarity]}>
                          {item.rarity} · {item.category}
                        </span>
                        <span className="font-mono tabular-nums text-white">
                          {item.costXp} XP
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{item.name}</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {owned ? (
                      <div className="min-h-[48px] rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Posseduto (usa in Profilo)
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyShopItem(item.id, item.costXp)}
                        className="w-full min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm cursor-pointer transition-colors"
                      >
                        {canAfford
                          ? `Sblocca con ${item.costXp} XP`
                          : `Servono ${item.costXp} XP`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Cosmetici facoltativi con denaro reale (DISATTIVATI finché non configurati) */}
          <div className="rounded-3xl bg-[#0F172A] border border-amber-500/30 p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-white">
                  2. Cosmetici facoltativi (Acquisto reale disattivato)
                </h3>
                <span className="text-xs font-bold text-amber-300">
                  Nessuna carta salvata · Solo estetico
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                I pagamenti con denaro reale sono attualmente{" "}
                <strong className="text-white">disattivati</strong> perché non è
                collegato alcun sistema di pagamento verificato. Per attivarli in
                futuro (es. tramite Google Play Billing) è necessaria la
                configurazione sicura da parte di un adulto responsabile. Nessun
                giocatore è mai obbligato a spendere denaro.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "opt-skin-1",
                  name: "Set Cornice Neon Pro",
                  desc: "Solo effetto visivo sul profilo gamer. Nessun vantaggio di gioco.",
                  price: "€1,99",
                  rarity: "Epico",
                },
                {
                  id: "opt-skin-2",
                  name: "Sfondo Arena Olografica",
                  desc: "Sfondo decorativo esclusivo per la tua scheda profilo.",
                  price: "€2,49",
                  rarity: "Epico",
                },
                {
                  id: "opt-skin-3",
                  name: "Pacchetto Emblemi Titanio",
                  desc: "Solo cosmetici estetici facoltativi di supporto al progetto.",
                  price: "€3,99",
                  rarity: "Leggendario",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className="rounded-2xl bg-[#141E34] border border-white/10 p-5 flex flex-col justify-between gap-4 opacity-90"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-violet-300">{opt.rarity} · Solo estetico</span>
                      <span className="font-mono text-white">{opt.price}</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{opt.name}</h4>
                    <p className="text-xs text-slate-300">{opt.desc}</p>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full min-h-[46px] rounded-xl bg-white/10 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Non attivo (richiede setup adulto)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
