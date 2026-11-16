import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Flame,
  Loader2,
  Play,
  PlusCircle,
} from "lucide-react";
import type {
  DailyGoal,
  GameInfo,
  MissionTier,
  PlayerLevel,
  PlayerProgress,
  ProgramDayItem,
  ScheduledWorkout,
  SkillKey,
  Workout,
} from "../types";
import {
  ALL_SKILL_KEYS,
  PROGRAM_30_DAYS,
  PROGRAM_7_DAYS,
  SKILL_LABELS,
} from "../data/games";
import { GamerCalendarPanel } from "./GamerCalendarPanel";

interface WorkoutsViewProps {
  activeGame: GameInfo;
  displayGameName: string;
  customGameTitle: string;
  playerLevel: PlayerLevel;
  workouts: Workout[];
  progress: PlayerProgress;
  dailyGoals: DailyGoal[];
  scheduledWorkouts: ScheduledWorkout[];
  onAddCustomWorkout: (workout: Workout) => void;
  onStartWorkout: (workout: Workout, programMeta?: { kind: "7d" | "30d"; day: number }) => void;
  onAddSchedule: (item: Omit<ScheduledWorkout, "id" | "completed">) => void;
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
}

type WorkoutsSubTab = "drills" | "program7" | "program30" | "calendar";

const DURATION_OPTIONS = [5, 10, 15];
const TIER_OPTIONS: MissionTier[] = ["Facile", "Media", "Difficile"];

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  activeGame,
  displayGameName,
  customGameTitle,
  playerLevel,
  workouts,
  progress,
  dailyGoals,
  scheduledWorkouts,
  onAddCustomWorkout,
  onStartWorkout,
  onAddSchedule,
  onToggleSchedule,
  onDeleteSchedule,
}) => {
  const [subTab, setSubTab] = useState<WorkoutsSubTab>("drills");
  const [selectedFocus, setSelectedFocus] = useState<SkillKey>(
    activeGame.keySkills[0] || "mira"
  );
  const [selectedTier, setSelectedTier] = useState<MissionTier>("Facile");
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [skillFilter, setSkillFilter] = useState<SkillKey | "all">("all");
  const [tierFilter, setTierFilter] = useState<MissionTier | "all">("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const gameWorkouts = workouts.filter((w) => {
    if (w.gameId !== activeGame.id) return false;
    if (skillFilter !== "all" && w.skillCategory !== skillFilter) return false;
    if (tierFilter !== "all" && w.missionTier !== tierFilter) return false;
    return true;
  });

  const warmupDrill = workouts.find(
    (w) => w.gameId === activeGame.id && w.isWarmup
  );
  const dailyDrill = workouts.find(
    (w) => w.gameId === activeGame.id && w.isDaily
  );

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await fetch("/api/coach/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: displayGameName,
          playerLevel,
          focusArea: SKILL_LABELS[selectedFocus],
          difficulty: selectedTier,
          durationMinutes: selectedMinutes,
        }),
      });

      const data = (await res.json()) as {
        workout?: Omit<Workout, "gameId" | "difficulty">;
        error?: string;
      };

      if (!res.ok || !data.workout) {
        throw new Error(data.error || "Impossibile creare l'allenamento adesso.");
      }

      const newWorkout: Workout = {
        ...data.workout,
        gameId: activeGame.id,
        difficulty: playerLevel,
      };

      onAddCustomWorkout(newWorkout);
    } catch (err) {
      setGenError(
        err instanceof Error
          ? err.message
          : "Errore nella creazione dell'allenamento. Riprova."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const launchProgramDay = (item: ProgramDayItem, kind: "7d" | "30d") => {
    const workout: Workout = {
      id: `prog-${kind}-day-${item.day}`,
      gameId: activeGame.id,
      title: `${kind === "7d" ? "Programma 7G" : "Programma 30G"} · Giorno ${item.day}`,
      description: item.title,
      durationMinutes: item.durationMinutes,
      difficulty: playerLevel,
      missionTier: item.day <= 3 ? "Facile" : item.day <= 15 ? "Media" : "Difficile",
      xpReward: item.xpReward,
      skillCategory: item.focusSkill,
      steps: [
        {
          id: `pstep-${kind}-${item.day}-1`,
          title: item.title,
          instruction: `${item.instruction} (Gioco: ${displayGameName})`,
          seconds: item.durationMinutes * 60,
        },
      ],
    };
    onStartWorkout(workout, { kind, day: item.day });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Allenamento · {displayGameName}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
            Riscaldamento pre-partita, missioni per difficoltà, esercizi AI su
            misura, programmi da 7 o 30 giorni e calendario personale.
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-2xl bg-[#0F172A] border border-white/10 p-2">
        <button
          type="button"
          onClick={() => setSubTab("drills")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
            subTab === "drills"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          Esercizi & Missioni
        </button>
        <button
          type="button"
          onClick={() => setSubTab("program7")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "program7"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          Programma 7G ({progress.completedProgram7Days.length}/7)
        </button>
        <button
          type="button"
          onClick={() => setSubTab("program30")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "program30"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Flame className="w-4 h-4 shrink-0" />
          Programma 30G ({progress.completedProgram30Days.length}/30)
        </button>
        <button
          type="button"
          onClick={() => setSubTab("calendar")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "calendar"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          Calendario Gamer ({scheduledWorkouts.length})
        </button>
      </div>

      {subTab === "drills" && (
        <>
          {/* Riscaldamento & Giornaliero */}
          {(warmupDrill || dailyDrill) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {warmupDrill && (
                <div className="rounded-3xl bg-[#0F172A] border border-blue-500/35 p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-400">
                      Riscaldamento prima delle partite · {warmupDrill.durationMinutes} min · +{warmupDrill.xpReward} XP
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                      {warmupDrill.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300">
                      {warmupDrill.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartWorkout(warmupDrill)}
                    className="w-full min-h-[54px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Avvia Riscaldamento
                  </button>
                </div>
              )}

              {dailyDrill && (
                <div className="rounded-3xl bg-[#0F172A] border border-violet-500/35 p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-violet-300">
                      Allenamento Giornaliero · {dailyDrill.durationMinutes} min · +{dailyDrill.xpReward} XP
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                      {dailyDrill.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300">
                      {dailyDrill.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartWorkout(dailyDrill)}
                    className="w-full min-h-[54px] rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Avvia Allenamento del Giorno
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Generatore Allenamento AI su Misura */}
          <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-sm font-semibold text-violet-300">
                Coach AI · {displayGameName} · {playerLevel}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Crea esercizio personalizzato
              </h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-300">
                  1. Abilità su cui lavorare
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILL_KEYS.map((key) => {
                    const active = selectedFocus === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedFocus(key)}
                        className={`min-h-[46px] px-4 rounded-2xl text-sm font-semibold cursor-pointer transition-colors ${
                          active
                            ? "bg-violet-600 text-white"
                            : "bg-[#162038] text-slate-300 hover:text-white border border-white/10"
                        }`}
                      >
                        {SKILL_LABELS[key]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-300">
                    2. Difficoltà missione
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIER_OPTIONS.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`min-h-[48px] rounded-2xl text-sm font-bold cursor-pointer transition-colors ${
                          selectedTier === tier
                            ? "bg-blue-600 text-white"
                            : "bg-[#162038] text-slate-300 hover:text-white border border-white/10"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-300">
                    3. Durata disponibile
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setSelectedMinutes(min)}
                        className={`min-h-[48px] rounded-2xl text-sm font-bold tabular-nums cursor-pointer transition-colors ${
                          selectedMinutes === min
                            ? "bg-blue-600 text-white"
                            : "bg-[#162038] text-slate-300 hover:text-white border border-white/10"
                        }`}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => void handleGenerate()}
                    className="w-full min-h-[52px] px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-white font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creazione in corso...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Genera con Coach AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {genError && (
              <div
                role="alert"
                className="rounded-2xl bg-rose-950/50 border border-rose-500/40 px-4 py-3 flex items-center gap-3 text-rose-200 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{genError}</span>
              </div>
            )}
          </section>

          {/* Filtri & Elenco Missioni */}
          <section className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">
                Missioni ed esercizi
              </h2>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTierFilter("all")}
                  className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    tierFilter === "all"
                      ? "bg-violet-600 text-white"
                      : "bg-[#0F172A] border border-white/10 text-slate-300"
                  }`}
                >
                  Tutte le difficoltà
                </button>
                {TIER_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(t)}
                    className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      tierFilter === t
                        ? "bg-violet-600 text-white"
                        : "bg-[#0F172A] border border-white/10 text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSkillFilter("all")}
                className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  skillFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-[#0F172A] border border-white/10 text-slate-300"
                }`}
              >
                Tutte le abilità
              </button>
              {ALL_SKILL_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSkillFilter(key)}
                  className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    skillFilter === key
                      ? "bg-blue-600 text-white"
                      : "bg-[#0F172A] border border-white/10 text-slate-300"
                  }`}
                >
                  {SKILL_LABELS[key]}
                </button>
              ))}
            </div>

            {gameWorkouts.length === 0 ? (
              <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 text-center space-y-2">
                <p className="text-lg font-semibold text-white">
                  Nessuna missione con questi filtri
                </p>
                <p className="text-sm text-slate-400">
                  Allarga i filtri oppure crea subito un esercizio personalizzato con il Coach AI qui sopra.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {gameWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-blue-400">
                        {workout.isCustom ? "Su misura AI · " : ""}
                        Missione {workout.missionTier} · {workout.durationMinutes} min · +{workout.xpReward} XP
                      </p>
                      <h3 className="text-xl font-bold text-white">
                        {workout.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {workout.description}
                      </p>
                      <p className="text-xs font-medium text-violet-300">
                        {SKILL_LABELS[workout.skillCategory]} · {workout.steps.length} passi guidati
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartWorkout(workout)}
                      className="w-full min-h-[52px] rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                    >
                      <Play className="w-5 h-5" />
                      Inizia Allenamento
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {subTab === "program7" && (
        <section className="space-y-5">
          <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7">
            <h2 className="text-2xl font-bold text-white">
              Programma Intensivo 7 Giorni · {displayGameName}
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-300">
              Un passo al giorno per costruire fondamenta solide in una settimana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROGRAM_7_DAYS.map((item) => {
              const done = progress.completedProgram7Days.includes(item.day);
              return (
                <div
                  key={item.day}
                  className={`rounded-3xl border p-6 flex flex-col justify-between gap-4 ${
                    done
                      ? "bg-[#112423] border-emerald-500/40"
                      : "bg-[#0F172A] border-white/10"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-400">
                        Giorno {item.day} · {item.durationMinutes} min · +{item.xpReward} XP
                      </span>
                      {done && (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Completato
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.instruction}
                    </p>
                    <p className="text-xs text-violet-300 font-medium">
                      Abilità: {SKILL_LABELS[item.focusSkill]}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => launchProgramDay(item, "7d")}
                    className={`w-full min-h-[50px] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      done
                        ? "bg-white/10 hover:bg-white/15 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    {done ? "Ripeti Giorno" : "Avvia Giorno " + item.day}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {subTab === "program30" && (
        <section className="space-y-5">
          <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7">
            <h2 className="text-2xl font-bold text-white">
              Percorso Completo 30 Giorni · {displayGameName}
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-300">
              Allenamento progressivo su tutte le 8 abilità principali: mira,
              riflessi, movimento, costruzione, strategia, precisione, tattica e
              decisioni.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROGRAM_30_DAYS.map((item) => {
              const done = progress.completedProgram30Days.includes(item.day);
              return (
                <div
                  key={item.day}
                  className={`rounded-3xl border p-5 flex flex-col justify-between gap-4 ${
                    done
                      ? "bg-[#112423] border-emerald-500/40"
                      : "bg-[#0F172A] border-white/10"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-violet-300 tabular-nums">
                        Giorno {item.day}/30 · {item.durationMinutes} min · +{item.xpReward} XP
                      </span>
                      {done && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.instruction}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => launchProgramDay(item, "30d")}
                    className={`w-full min-h-[48px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      done
                        ? "bg-white/10 hover:bg-white/15 text-white"
                        : "bg-violet-600 hover:bg-violet-500 text-white"
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    {done ? "Ripeti Giorno" : "Inizia Giorno " + item.day}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {subTab === "calendar" && (
        <GamerCalendarPanel
          activeGameId={activeGame.id}
          customGameTitle={customGameTitle}
          scheduledWorkouts={scheduledWorkouts}
          dailyGoals={dailyGoals}
          progress={progress}
          onAddSchedule={onAddSchedule}
          onToggleSchedule={onToggleSchedule}
          onDeleteSchedule={onDeleteSchedule}
        />
      )}
    </div>
  );
};
