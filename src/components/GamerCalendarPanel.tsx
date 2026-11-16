import React, { useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  DailyGoal,
  GameId,
  PlayerProgress,
  ScheduledWorkout,
} from "../types";
import { GAMES, getDisplayGameName } from "../data/games";

interface GamerCalendarPanelProps {
  activeGameId: GameId;
  customGameTitle: string;
  scheduledWorkouts: ScheduledWorkout[];
  dailyGoals: DailyGoal[];
  progress: PlayerProgress;
  onAddSchedule: (item: Omit<ScheduledWorkout, "id" | "completed">) => void;
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
}

export const GamerCalendarPanel: React.FC<GamerCalendarPanelProps> = ({
  activeGameId,
  customGameTitle,
  scheduledWorkouts,
  dailyGoals,
  progress,
  onAddSchedule,
  onToggleSchedule,
  onDeleteSchedule,
}) => {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [gameId, setGameId] = useState<GameId>(activeGameId);
  const [dateISO, setDateISO] = useState(todayISO);
  const [time, setTime] = useState("18:00");
  const [reminder, setReminder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddSchedule({
      title: title.trim(),
      gameId,
      dateISO,
      time,
      reminderEnabled: reminder,
    });
    setTitle("");
    setReminder(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Pianifica nuovo impegno */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
      >
        <div className="flex items-center gap-2.5 text-blue-400 text-sm font-bold">
          <Calendar className="w-5 h-5" />
          Calendario Gamer Personale
        </div>
        <h2 className="text-2xl font-bold text-white">
          Pianifica un allenamento
        </h2>

        <div className="space-y-2">
          <label htmlFor="cal-title" className="text-sm font-semibold text-slate-300 block">
            Titolo impegno
          </label>
          <input
            id="cal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Riscaldamento + 2 partite rank"
            className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cal-game" className="text-sm font-semibold text-slate-300 block">
            Gioco
          </label>
          <select
            id="cal-game"
            value={gameId}
            onChange={(e) => setGameId(e.target.value as GameId)}
            className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm text-white"
          >
            {GAMES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="cal-date" className="text-sm font-semibold text-slate-300 block">
              Data
            </label>
            <input
              id="cal-date"
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cal-time" className="text-sm font-semibold text-slate-300 block">
              Ora
            </label>
            <input
              id="cal-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReminder((v) => !v)}
          className={`w-full min-h-[48px] px-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer ${
            reminder
              ? "bg-violet-600/20 border-violet-400 text-white"
              : "bg-[#141E34] border-white/10 text-slate-300"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Promemoria visivo in app (nessuna notifica senza consenso)
          </span>
          <span className="font-bold">{reminder ? "SI" : "NO"}</span>
        </button>

        <button
          type="submit"
          className="w-full min-h-[52px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Aggiungi al Calendario
        </button>
      </form>

      {/* Lista impegni + Completati + Missioni */}
      <div className="lg:col-span-7 space-y-5">
        <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">
            Allenamenti pianificati
          </h3>
          {scheduledWorkouts.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nessun allenamento pianificato. Aggiungine uno a fianco per organizzare la settimana.
            </p>
          ) : (
            <div className="space-y-2.5">
              {scheduledWorkouts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3.5 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onToggleSchedule(item.id)}
                    className="flex items-start gap-3 text-left flex-1 cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-bold text-sm sm:text-base ${
                          item.completed ? "text-slate-400 line-through" : "text-white"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 tabular-nums">
                        {getDisplayGameName(item.gameId, customGameTitle)} ·{" "}
                        {item.dateISO} alle {item.time}
                        {item.reminderEnabled ? " · Promemoria attivo" : ""}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-label="Elimina impegno"
                    onClick={() => onDeleteSchedule(item.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-3">
          <h3 className="text-xl font-bold text-white">
            Riepilogo Missioni Oggi & Sessioni Completate
          </h3>
          <p className="text-sm text-slate-300 tabular-nums">
            Obiettivi giornalieri completati: {dailyGoals.filter((g) => g.completed).length}/
            {dailyGoals.length} · Allenamenti completati in totale:{" "}
            {progress.completedWorkoutsCount}
          </p>
          {progress.recentSessions.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-[#141E34] border border-white/5 px-4 py-2.5 flex justify-between text-xs sm:text-sm"
            >
              <span className="text-white font-semibold">{s.workoutTitle}</span>
              <span className="text-emerald-400 font-mono tabular-nums">
                {s.dateISO} · +{s.xpEarned} XP
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
