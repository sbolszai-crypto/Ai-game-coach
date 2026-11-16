import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Copy,
  Crown,
  LogOut,
  Play,
  Plus,
  Shield,
  ShieldCheck,
  Swords,
  Zap,
} from "lucide-react";
import type { GamingTeam, PlayerLevel, TeamRole, Workout } from "../types";

interface TeamsPanelProps {
  nickname: string;
  activeGameId: GamingTeam["id"] extends never ? never : import("../types").GameId;
  displayGameName: string;
  playerLevel: PlayerLevel;
  team: GamingTeam | null;
  onCreateTeam: (team: GamingTeam) => void;
  onUpdateTeam: (team: GamingTeam) => void;
  onLeaveTeam: () => void;
  onStartTeamWorkout: (workout: Workout) => void;
}

const LOGOS: Array<{ id: GamingTeam["logo"]; label: string }> = [
  { id: "shield", label: "Scudo" },
  { id: "sword", label: "Spada" },
  { id: "bolt", label: "Fulmine" },
  { id: "crown", label: "Corona" },
];

const ROLES: TeamRole[] = ["Capitano", "Stratega", "Attaccante", "Supporto"];

export const TeamsPanel: React.FC<TeamsPanelProps> = ({
  nickname,
  activeGameId,
  displayGameName,
  playerLevel,
  team,
  onCreateTeam,
  onUpdateTeam,
  onLeaveTeam,
  onStartTeamWorkout,
}) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [logo, setLogo] = useState<GamingTeam["logo"]>("shield");

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>("Stratega");
  const [newStrategy, setNewStrategy] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const renderLogo = (id: GamingTeam["logo"], cls = "w-7 h-7") => {
    switch (id) {
      case "shield":
        return <Shield className={cls} />;
      case "sword":
        return <Swords className={cls} />;
      case "bolt":
        return <Zap className={cls} />;
      case "crown":
        return <Crown className={cls} />;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const code = `GC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    onCreateTeam({
      id: `team-${Date.now()}`,
      name: name.trim(),
      logo,
      description:
        desc.trim() || `Squadra dedicata a migliorare insieme su ${displayGameName}.`,
      inviteCode: code,
      members: [
        {
          id: `mem-${Date.now()}`,
          nickname,
          role: "Capitano",
        },
      ],
      strategies: [],
      teamGoals: [
        {
          id: `tg-${Date.now()}`,
          text: "Fare 10 minuti di allenamento coordinato insieme",
          done: false,
        },
      ],
    });
    setName("");
    setDesc("");
  };

  if (!team) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleCreate}
          className="lg:col-span-7 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              Crea la tua Squadra Gaming
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Scegli nome, logo, descrizione e ruoli per organizzare strategie e
              allenamenti di gruppo.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-semibold text-slate-300 block">
              Nome squadra
            </label>
            <input
              id="team-name"
              type="text"
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. BlueStorm Italia"
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-300">Logo squadra</p>
            <div className="grid grid-cols-4 gap-2.5">
              {LOGOS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLogo(l.id)}
                  className={`min-h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    logo === l.id
                      ? "bg-blue-600/25 border-blue-400 text-white"
                      : "bg-[#141E34] border-white/10 text-slate-300"
                  }`}
                >
                  {renderLogo(l.id, "w-6 h-6")}
                  <span className="text-xs font-semibold">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="team-desc" className="text-sm font-semibold text-slate-300 block">
              Descrizione
            </label>
            <textarea
              id="team-desc"
              rows={2}
              maxLength={180}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Obiettivi del gruppo, stile di gioco e orari..."
              className="w-full rounded-2xl bg-[#141E34] border border-white/15 p-3.5 text-base text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[54px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base cursor-pointer"
          >
            Crea Squadra
          </button>
        </form>

        <div className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-emerald-500/30 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            Protezione dei minorenni nelle squadre
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Gli inviti funzionano solo tramite codice squadra controllato dal capitano.
            Non esistono chat private con sconosciuti, nessuna condivisione di numeri
            di telefono o posizioni reali, e puoi uscire dalla squadra in qualsiasi
            momento con un tocco.
          </p>
        </div>
      </div>
    );
  }

  const launchGroupWorkout = () => {
    const workout: Workout = {
      id: `team-workout-${Date.now()}`,
      gameId: activeGameId,
      title: `Allenamento di Gruppo · ${team.name}`,
      description: `Sessione coordinata di squadra su ${displayGameName}.`,
      durationMinutes: 8,
      difficulty: playerLevel,
      missionTier: "Media",
      xpReward: 65,
      skillCategory: "tattica",
      steps: [
        {
          id: "tw-1",
          title: "Comunicazione chiara",
          instruction:
            "Assegnate i ruoli (Capitano, Stratega, Attaccante, Supporto) prima dell'avvio.",
          seconds: 150,
        },
        {
          id: "tw-2",
          title: "Esecuzione coordinata",
          instruction:
            "Applicate una delle strategie salvate nella scheda squadra senza muovervi isolati.",
          seconds: 330,
        },
      ],
    };
    onStartTeamWorkout(workout);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#0F172A] border border-blue-500/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shrink-0">
            {renderLogo(team.logo, "w-7 h-7")}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{team.name}</h2>
            <p className="text-sm text-slate-300">{team.description}</p>
            <p className="text-xs text-blue-400 font-mono mt-1">
              Codice invito controllato: {team.inviteCode}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(team.inviteCode);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="min-h-[46px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            {copiedCode ? "Codice copiato" : "Copia invito"}
          </button>

          <button
            type="button"
            onClick={onLeaveTeam}
            className="min-h-[46px] px-4 rounded-xl bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 text-xs font-bold text-rose-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Esci dalla squadra
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Membri e Ruoli */}
        <section className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">Membri e Ruoli</h3>

          <div className="space-y-2">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 flex items-center justify-between gap-2"
              >
                <span className="font-semibold text-white text-sm">
                  {m.nickname}
                </span>
                <select
                  aria-label={`Ruolo di ${m.nickname}`}
                  value={m.role}
                  onChange={(e) =>
                    onUpdateTeam({
                      ...team,
                      members: team.members.map((item) =>
                        item.id === m.id
                          ? { ...item, role: e.target.value as TeamRole }
                          : item
                      ),
                    })
                  }
                  className="rounded-xl bg-[#0B101D] border border-white/15 px-2.5 py-1.5 text-xs font-bold text-blue-300"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="text-xs font-semibold text-slate-400">
              Aggiungi compagno fidato (solo nickname)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nickname compagno"
                className="flex-1 min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as TeamRole)}
                className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 px-2.5 text-xs text-white"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!newMemberName.trim()) return;
                  onUpdateTeam({
                    ...team,
                    members: [
                      ...team.members,
                      {
                        id: `mem-${Date.now()}`,
                        nickname: newMemberName.trim(),
                        role: newMemberRole,
                      },
                    ],
                  });
                  setNewMemberName("");
                }}
                className="min-h-[44px] px-3 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Strategie, Obiettivi & Allenamento Gruppo */}
        <section className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-white">
                Obiettivi & Allenamento di Gruppo
              </h3>
              <button
                type="button"
                onClick={launchGroupWorkout}
                className="min-h-[46px] px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Avvia Allenamento Squadra
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Nuovo obiettivo di squadra..."
                className="flex-1 min-h-[46px] rounded-xl bg-[#141E34] border border-white/15 px-3.5 text-sm text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newGoal.trim()) return;
                  onUpdateTeam({
                    ...team,
                    teamGoals: [
                      ...team.teamGoals,
                      { id: `tg-${Date.now()}`, text: newGoal.trim(), done: false },
                    ],
                  });
                  setNewGoal("");
                }}
                className="min-h-[46px] px-4 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Aggiungi
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {team.teamGoals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    onUpdateTeam({
                      ...team,
                      teamGoals: team.teamGoals.map((item) =>
                        item.id === g.id ? { ...item, done: !item.done } : item
                      ),
                    })
                  }
                  className="w-full py-3 flex items-center gap-3 text-left cursor-pointer"
                >
                  {g.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      g.done ? "text-slate-400 line-through" : "text-white"
                    }`}
                  >
                    {g.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Strategie della Squadra</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStrategy}
                onChange={(e) => setNewStrategy(e.target.value)}
                placeholder="Condividi una tattica di gruppo..."
                className="flex-1 min-h-[46px] rounded-xl bg-[#141E34] border border-white/15 px-3.5 text-sm text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newStrategy.trim()) return;
                  onUpdateTeam({
                    ...team,
                    strategies: [newStrategy.trim(), ...team.strategies],
                  });
                  setNewStrategy("");
                }}
                className="min-h-[46px] px-4 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Salva
              </button>
            </div>
            {team.strategies.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nessuna strategia salvata ancora.
              </p>
            ) : (
              <ul className="space-y-2">
                {team.strategies.map((s, idx) => (
                  <li
                    key={`${idx}-${s}`}
                    className="rounded-xl bg-[#141E34] border border-white/10 px-4 py-3 text-sm text-slate-200"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
