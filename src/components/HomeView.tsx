import React from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Gamepad2,
  MessageSquare,
  Play,
  Trophy,
} from "lucide-react";
import type {
  DailyGoal,
  GameId,
  GameInfo,
  GamerProfile,
  NavTab,
  PlayerLevel,
  PlayerProgress,
  Workout,
} from "../types";
import { GAMES, SKILL_LABELS, getRankTitle } from "../data/games";
import { GameEmblem, GamerAvatarBadge } from "./GameEmblem";

interface HomeViewProps {
  profile: GamerProfile;
  activeGame: GameInfo;
  displayGameName: string;
  onChangeLevel: (level: PlayerLevel) => void;
  onSelectGame: (gameId: GameId) => void;
  onUpdateCustomGameTitle: (title: string) => void;
  dailyGoals: DailyGoal[];
  onToggleGoal: (goalId: string) => void;
  warmupWorkout: Workout;
  dailyWorkout: Workout;
  onStartWorkout: (workout: Workout) => void;
  onNavigate: (tab: NavTab) => void;
  onOpenCoachMedia: () => void;
  onOpenCatalog: () => void;
  progress: PlayerProgress;
}

const LEVELS: PlayerLevel[] = ["Principiante", "Intermedio", "Avanzato"];

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  activeGame,
  displayGameName,
  onChangeLevel,
  onSelectGame,
  onUpdateCustomGameTitle,
  dailyGoals,
  onToggleGoal,
  warmupWorkout,
  dailyWorkout,
  onStartWorkout,
  onNavigate,
  onOpenCoachMedia,
  onOpenCatalog,
  progress,
}) => {
  const completedGoalsCount = dailyGoals.filter((g) => g.completed).length;
  const levelNumber = Math.floor(progress.xp / 150) + 1;
  const rankTitle = getRankTitle(progress.xp);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#0F172A] to-violet-950/60" />
        <img
          src="/src/assets/images/hero_arena_banner_1794854816030.jpg"
          alt="Arena di allenamento GAMECOACH AI"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/75 to-[#070B14]/45" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-3.5">
                <GamerAvatarBadge avatarId={profile.avatarId} sizeClass="h-12 w-12" />
                <div>
                  <p className="text-sm font-semibold text-blue-400">
                    Bentornato, {profile.nickname} · {rankTitle}
                  </p>
                  <p className="text-xs text-slate-300">
                    Gioco attivo: {displayGameName} · {activeGame.genre}
                  </p>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance] max-w-2xl">
                Il tuo allenatore personale di gaming eSports
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Analizza le tue partite con Coach Marco, segui programmi da 7 o 30
                giorni e migliora con dati reali registrati nel tempo.
              </p>

              {/* Level selector */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Livello di allenamento
                </p>
                <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-[#070B14]/80 border border-white/10 p-1.5">
                  {LEVELS.map((lvl) => {
                    const active = profile.level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => onChangeLevel(lvl)}
                        className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                          active
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("coach")}
                  className="min-h-[56px] px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  Parla con Coach Marco
                </button>
                <button
                  type="button"
                  onClick={() => onStartWorkout(warmupWorkout)}
                  className="min-h-[56px] px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer transition-all"
                >
                  <Play className="w-5 h-5" />
                  Riscaldamento ({warmupWorkout.durationMinutes} min)
                </button>
                <button
                  type="button"
                  onClick={onOpenCoachMedia}
                  className="min-h-[56px] px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                >
                  <Camera className="w-5 h-5 text-blue-300" />
                  Replay Lab
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("tournaments")}
                  className="min-h-[56px] px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                >
                  <Trophy className="w-5 h-5 text-violet-300" />
                  Tournament Finder
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("arcade")}
                  className="min-h-[56px] px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                >
                  <Gamepad2 className="w-5 h-5 text-emerald-300" />
                  GAMECOACH Arcade
                </button>
              </div>
            </div>

            {/* Coach Spotlight Card */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-[#0B101D]/90 border border-white/15 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 border border-white/15">
                    <img
                      src="/src/assets/images/coach_avatar_1794854815932.jpg"
                      alt="Avatar di Coach Marco"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-300">
                      Coach Marco · AI
                    </p>
                    <h2 className="text-xl font-bold text-white">
                      Focus su {displayGameName}
                    </h2>
                  </div>
                </div>

                <p className="text-base text-slate-200 leading-relaxed">
                  “{activeGame.shortTip}”
                </p>

                {profile.weaknesses.length > 0 && (
                  <p className="text-xs text-blue-300">
                    Ultimo punto su cui lavorare: {profile.weaknesses[0]}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate("coach")}
                  className="w-full min-h-[48px] rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  Racconta com'è andata l'ultima partita
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real KPI Row */}
      <section aria-label="Riepilogo reale" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Livello & Grado</span>
            <Trophy className="w-5 h-5 text-violet-400" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white">
            Liv. {levelNumber}
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {rankTitle} · {progress.xp} XP
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Giorni consecutivi</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white">
            {progress.streakDays} {progress.streakDays === 1 ? "giorno" : "giorni"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {progress.streakDays === 0 ? "Completa oggi il primo esercizio" : "Serie attiva"}
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Obiettivi oggi</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white">
            {completedGoalsCount}/{dailyGoals.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Completati oggi</p>
        </div>

        <div className="rounded-2xl bg-[#0F172A] border border-white/10 p-5">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Pratica registrata</span>
            <Dumbbell className="w-5 h-5 text-blue-400" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white">
            {progress.completedWorkoutsCount}
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {progress.totalMinutes} min · {progress.matchDiary.length} partite
          </p>
        </div>
      </section>

      {/* Selezione rapida 10 giochi */}
      <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Giochi supportati
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Scegli il tuo gioco per adattare Coach Marco, riscaldamento e missioni
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-blue-400">
              10 principali + 5.500+ nel catalogo
            </span>
            <button
              type="button"
              onClick={onOpenCatalog}
              className="min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs sm:text-sm font-bold text-white cursor-pointer transition-all"
            >
              Esplora 5.500+ Giochi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {GAMES.map((game) => {
            const isSelected = game.id === activeGame.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => onSelectGame(game.id)}
                className={`min-h-[92px] p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-[#141E34] border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                <GameEmblem
                  gameId={game.id}
                  className={`w-7 h-7 ${isSelected ? "text-blue-400" : "text-violet-300"}`}
                />
                <span className="text-xs sm:text-sm font-bold leading-tight">
                  {game.name}
                </span>
              </button>
            );
          })}
        </div>

        {activeGame.id === "altri" && (
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <label
              htmlFor="custom-game-home"
              className="text-sm font-semibold text-slate-300 shrink-0"
            >
              Nome del tuo gioco:
            </label>
            <input
              id="custom-game-home"
              type="text"
              value={profile.customGameTitle}
              onChange={(e) => onUpdateCustomGameTitle(e.target.value)}
              placeholder="Es. Valorant, Apex Legends, Clash Royale..."
              className="flex-1 min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </section>

      {/* Obiettivi giornalieri + Allenamento del giorno */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Obiettivi giornalieri
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Si completano in automatico mentre ti alleni o toccandoli qui
              </p>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-blue-400">
              {completedGoalsCount} di {dailyGoals.length}
            </span>
          </div>

          <div className="mt-3 divide-y divide-white/10">
            {dailyGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => onToggleGoal(goal.id)}
                className="w-full min-h-[64px] py-4 px-2 flex items-center justify-between gap-4 text-left hover:bg-white/[0.03] rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <Circle className="w-7 h-7 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-base sm:text-lg font-semibold ${
                        goal.completed ? "text-slate-400 line-through" : "text-white"
                      }`}
                    >
                      {goal.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {goal.subtitle}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 font-mono text-sm font-bold tabular-nums ${
                    goal.completed ? "text-emerald-400" : "text-violet-300"
                  }`}
                >
                  {goal.completed ? "Fatto" : `+${goal.xpReward} XP`}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Allenamento di oggi
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("workouts")}
              className="min-h-[44px] px-3 text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Programmi 7/30g
            </button>
          </div>

          <div className="rounded-2xl bg-[#162038] border border-white/10 p-5 space-y-3">
            <p className="text-xs font-semibold text-violet-300">
              {displayGameName} · {dailyWorkout.durationMinutes} min ·{" "}
              {SKILL_LABELS[dailyWorkout.skillCategory]} · +{dailyWorkout.xpReward} XP
            </p>
            <h3 className="text-xl font-bold text-white">
              {dailyWorkout.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {dailyWorkout.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onStartWorkout(dailyWorkout)}
            className="w-full min-h-[56px] rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <Play className="w-5 h-5" />
            Inizia Allenamento del Giorno
          </button>

          <button
            type="button"
            onClick={() => onNavigate("stats")}
            className="w-full min-h-[52px] rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            Apri Diario Partite e Statistiche
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
