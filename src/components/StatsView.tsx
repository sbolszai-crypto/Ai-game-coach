import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Swords,
  Trophy,
} from "lucide-react";
import type {
  DailyGoal,
  GameId,
  GamerProfile,
  MatchLogEntry,
  PlayerProgress,
} from "../types";
import {
  ALL_SKILL_KEYS,
  GAMES,
  SKILL_LABELS,
  getDisplayGameName,
} from "../data/games";
import { GameEmblem } from "./GameEmblem";
import { SkillRadarChart } from "./SkillRadarChart";

interface StatsViewProps {
  profile: GamerProfile;
  progress: PlayerProgress;
  dailyGoals: DailyGoal[];
  activeGameId: GameId;
  teamActive: boolean;
  onAddMatchLog: (entry: Omit<MatchLogEntry, "id" | "dateISO" | "createdAtLabel">) => void;
  onAnalyzeMatchWithCoach: (match: MatchLogEntry) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  profile,
  progress,
  dailyGoals,
  activeGameId,
  teamActive,
  onAddMatchLog,
  onAnalyzeMatchWithCoach,
}) => {
  const [matchGameId, setMatchGameId] = useState<GameId>(activeGameId);
  const [outcome, setOutcome] = useState<MatchLogEntry["outcome"]>("Vittoria");
  const [duration, setDuration] = useState<number>(15);
  const [highlight, setHighlight] = useState("");
  const [mistake, setMistake] = useState("");

  const completedGoalsCount = dailyGoals.filter((g) => g.completed).length;

  const winStats = useMemo(() => {
    const total = progress.matchDiary.length;
    if (total === 0) return { total: 0, wins: 0, winRate: null as number | null };
    const wins = progress.matchDiary.filter((m) => m.outcome === "Vittoria").length;
    return {
      total,
      wins,
      winRate: Math.round((wins / total) * 100),
    };
  }, [progress.matchDiary]);

  // Calendario del mese corrente basato solo sui giorni realmente attivi
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Lunedì = 0
    const monthLabel = now.toLocaleDateString("it-IT", {
      month: "long",
      year: "numeric",
    });

    const activeSet = new Set(progress.activeDates);
    const cells: Array<{ day: number | null; iso: string; active: boolean }> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, iso: `empty-${i}`, active: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, iso, active: activeSet.has(iso) });
    }
    return { monthLabel, cells };
  }, [progress.activeDates]);

  // Andamento progressi reale per data registrata
  const realTimeline = useMemo(() => {
    const map = new Map<string, { minutes: number; sessions: number }>();
    for (const s of progress.recentSessions) {
      const prev = map.get(s.dateISO) ?? { minutes: 0, sessions: 0 };
      map.set(s.dateISO, {
        minutes: prev.minutes + s.durationMinutes,
        sessions: prev.sessions + 1,
      });
    }
    return Array.from(map.entries())
      .slice(0, 7)
      .reverse();
  }, [progress.recentSessions]);

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMatchLog({
      gameId: matchGameId,
      customGameTitle:
        matchGameId === "altri" ? profile.customGameTitle : undefined,
      outcome,
      durationMinutes: Math.max(1, Math.min(180, Number(duration) || 10)),
      highlight: highlight.trim() || "Nessuna nota aggiunta",
      mistake: mistake.trim() || "Nessun errore indicato",
    });
    setHighlight("");
    setMistake("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Statistiche Reali, Skill Radar e Diario Partite
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
          Qui vengono mostrati esclusivamente i dati reali registrati dai tuoi
          allenamenti, obiettivi e partite inserite nel diario.
        </p>
      </div>

      {/* KPI Reali */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Minuti allenamento</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-white">
            {progress.totalMinutes} min
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {progress.completedWorkoutsCount} missioni completate
          </p>
        </div>

        <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Obiettivi oggi</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-white">
            {completedGoalsCount}/{dailyGoals.length}
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {progress.xp} XP guadagnati
          </p>
        </div>

        <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Partite registrate</span>
            <Swords className="w-5 h-5 text-violet-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-white">
            {winStats.total}
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {winStats.winRate === null
              ? "Registra la prima partita"
              : `${winStats.wins} vittorie (${winStats.winRate}%)`}
          </p>
        </div>

        <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Giorni attivi</span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-white">
            {progress.activeDates.length}
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            Serie attuale: {progress.streakDays}g
          </p>
        </div>
      </section>

      {/* Skill Radar Reale */}
      <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7">
        <SkillRadarChart progress={progress} teamActive={teamActive} />
      </section>

      {/* Andamento Progressi + Calendario */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Andamento dei progressi
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Minuti di pratica registrati per giornata e crescita delle 8 abilità
            </p>
          </div>

          {realTimeline.length === 0 ? (
            <div className="rounded-2xl bg-[#141E34] border border-white/10 p-5 text-sm text-slate-300">
              Nessun allenamento completato ancora. Avvia un esercizio nella sezione
              Allenamento per iniziare a tracciare il grafico reale.
            </div>
          ) : (
            <div className="space-y-2.5">
              {realTimeline.map(([date, info]) => {
                const widthPct = Math.min(100, Math.max(12, info.minutes * 4));
                return (
                  <div key={date} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300 tabular-nums">
                      <span>{date}</span>
                      <span>
                        {info.minutes} min · {info.sessions} sessioni
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 space-y-3 border-t border-white/10">
            <h3 className="text-base font-bold text-white">
              Livello reale delle 8 abilità
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_SKILL_KEYS.map((key) => {
                const val = Math.min(100, progress.skills[key] ?? 0);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{SKILL_LABELS[key]}</span>
                      <span className="font-mono tabular-nums text-blue-400">
                        {val}/100
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 transition-all"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calendario Allenamenti */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                Calendario · {calendarData.monthLabel}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                I giorni evidenziati mostrano quando ti sei allenato o hai registrato partite
              </p>
            </div>
            <Calendar className="w-6 h-6 text-blue-400 shrink-0" />
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pt-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Gio</span>
            <span>Ven</span>
            <span>Sab</span>
            <span>Dom</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarData.cells.map((cell) =>
              cell.day === null ? (
                <div key={cell.iso} className="h-11" />
              ) : (
                <div
                  key={cell.iso}
                  className={`h-11 rounded-xl flex items-center justify-center font-mono text-sm font-bold tabular-nums border ${
                    cell.active
                      ? "bg-blue-600/30 border-blue-400 text-white"
                      : "bg-[#141E34] border-white/5 text-slate-400"
                  }`}
                >
                  {cell.day}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Diario delle Partite */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleMatchSubmit}
          className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              Registra una partita
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Aggiungi una partita reale al tuo diario per analizzarla con Coach Marco
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="match-game" className="text-sm font-semibold text-slate-300 block">
              Gioco
            </label>
            <select
              id="match-game"
              value={matchGameId}
              onChange={(e) => setMatchGameId(e.target.value as GameId)}
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
            >
              {GAMES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-300">Esito</p>
            <div className="grid grid-cols-3 gap-2">
              {(["Vittoria", "Sconfitta", "Pareggio"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={`min-h-[48px] rounded-2xl text-sm font-bold cursor-pointer transition-colors ${
                    outcome === o
                      ? o === "Vittoria"
                        ? "bg-emerald-600 text-white"
                        : o === "Sconfitta"
                        ? "bg-rose-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-[#141E34] border border-white/10 text-slate-300"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="match-duration" className="text-sm font-semibold text-slate-300 block">
              Durata (minuti)
            </label>
            <input
              id="match-duration"
              type="number"
              min={1}
              max={180}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white tabular-nums focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="match-highlight" className="text-sm font-semibold text-slate-300 block">
              Cosa ha funzionato bene?
            </label>
            <input
              id="match-highlight"
              type="text"
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="Es. Ho usato bene le coperture nei duelli"
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="match-mistake" className="text-sm font-semibold text-slate-300 block">
              Errore principale da correggere
            </label>
            <input
              id="match-mistake"
              type="text"
              value={mistake}
              onChange={(e) => setMistake(e.target.value)}
              placeholder="Es. Troppa fretta nello scontro finale"
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[54px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5" />
            Salva nel Diario Partite
          </button>
        </form>

        <div className="lg:col-span-7 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Diario delle partite
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Cronologia delle partite reali registrate da te
            </p>
          </div>

          {progress.matchDiary.length === 0 ? (
            <div className="rounded-2xl bg-[#141E34] border border-white/10 p-6 text-center space-y-2">
              <p className="text-base font-semibold text-white">
                Nessuna partita registrata ancora
              </p>
              <p className="text-sm text-slate-400">
                Usa il modulo qui a fianco dopo una partita: ti aiuta a capire gli
                errori ricorrenti e sblocca i trofei.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.matchDiary.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl bg-[#141E34] border border-white/10 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <GameEmblem gameId={m.gameId} className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="font-bold text-white">
                          {getDisplayGameName(m.gameId, m.customGameTitle)} ·{" "}
                          <span
                            className={
                              m.outcome === "Vittoria"
                                ? "text-emerald-400"
                                : m.outcome === "Sconfitta"
                                ? "text-rose-400"
                                : "text-blue-300"
                            }
                          >
                            {m.outcome}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {m.createdAtLabel} · {m.durationMinutes} min
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAnalyzeMatchWithCoach(m)}
                      className="min-h-[44px] px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Analizza col Coach
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <p className="text-slate-300">
                      <span className="font-semibold text-emerald-400">Bene: </span>
                      {m.highlight}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold text-amber-300">Errore: </span>
                      {m.mistake}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
