import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Download,
  Eye,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type {
  AccessibilitySettings,
  AvatarId,
  CoachPersonality,
  GameId,
  GamerProfile,
  PlayerLevel,
  PlayerProgress,
} from "../types";
import {
  COACH_PERSONALITIES,
  GAMES,
  SHOP_ITEMS,
  getRankTitle,
} from "../data/games";
import { AVATAR_OPTIONS, GamerAvatarBadge } from "./GameEmblem";
import { storageRepository } from "../services/storage";

interface ProfileViewProps {
  profile: GamerProfile;
  progress: PlayerProgress;
  purchasedItemIds: string[];
  accessibility: AccessibilitySettings;
  onUpdateProfile: (patch: Partial<GamerProfile>) => void;
  onUpdateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  onAddPersonalGoal: (text: string) => void;
  onTogglePersonalGoal: (id: string) => void;
  onDeletePersonalGoal: (id: string) => void;
  onRemoveWeakness: (weakness: string) => void;
  onExportData: () => void;
  onWipeAllData: () => void;
  onOpenCatalog: () => void;
}

const LEVELS: PlayerLevel[] = ["Principiante", "Intermedio", "Avanzato"];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  progress,
  purchasedItemIds,
  accessibility,
  onUpdateProfile,
  onUpdateAccessibility,
  onAddPersonalGoal,
  onTogglePersonalGoal,
  onDeletePersonalGoal,
  onRemoveWeakness,
  onExportData,
  onWipeAllData,
  onOpenCatalog,
}) => {
  const [goalInput, setGoalInput] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);

  const equippedFrame = SHOP_ITEMS.find((i) => i.id === profile.equippedFrameId);
  const equippedBg = SHOP_ITEMS.find((i) => i.id === profile.equippedBgId);
  const equippedBadge = SHOP_ITEMS.find((i) => i.id === profile.equippedBadgeId);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    onAddPersonalGoal(goalInput.trim());
    setGoalInput("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Profilo Gamer & Accessibilità
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
          Personalizza nickname, stile del Coach, obiettivi personali, accessibilità e
          gestisci la privacy dei tuoi dati.
        </p>
      </div>

      {/* Scheda Gamer + Avatar + Cornici */}
      <section
        className={`rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 ${
          equippedBg?.previewClass || "bg-[#0F172A]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl ${equippedFrame?.previewClass || ""}`}>
              <GamerAvatarBadge avatarId={profile.avatarId} sizeClass="h-16 w-16" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.nickname}</h2>
              <p className="text-sm text-blue-400 font-semibold">
                {getRankTitle(progress.xp)} · {profile.level} ·{" "}
                <span className="tabular-nums font-mono">{progress.xp} XP</span>
              </p>
              {equippedBadge && (
                <p className={`text-xs font-bold mt-0.5 ${equippedBadge.previewClass}`}>
                  Badge equipaggiato: {equippedBadge.name}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs font-semibold text-emerald-400">
            GAMECOACH AI · 100% Gratuita
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="prof-nick" className="text-sm font-semibold text-slate-300 block">
              Nickname (mai usare il nome reale completo)
            </label>
            <input
              id="prof-nick"
              type="text"
              maxLength={24}
              value={profile.nickname}
              onChange={(e) =>
                onUpdateProfile({ nickname: e.target.value || "Giocatore" })
              }
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="prof-game" className="text-sm font-semibold text-slate-300 block">
                Gioco preferito
              </label>
              <button
                type="button"
                onClick={onOpenCatalog}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                + Cerca tra 5.500+ giochi
              </button>
            </div>
            <select
              id="prof-game"
              value={profile.favoriteGameId}
              onChange={(e) =>
                onUpdateProfile({ favoriteGameId: e.target.value as GameId })
              }
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
            >
              {GAMES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id === "altri" && profile.customGameTitle
                    ? `Altri (${profile.customGameTitle})`
                    : g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="prof-bio" className="text-sm font-semibold text-slate-300 block">
            Bio Gamer (visibile nella tua scheda Community)
          </label>
          <input
            id="prof-bio"
            type="text"
            maxLength={140}
            value={profile.bio}
            onChange={(e) => onUpdateProfile({ bio: e.target.value })}
            placeholder="Descrivi il tuo stile di gioco e i tuoi obiettivi..."
            className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Avatar selezionabile */}
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-300">Scegli Avatar</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {AVATAR_OPTIONS.map((av) => {
              const selected = profile.avatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => onUpdateProfile({ avatarId: av.id as AvatarId })}
                  className={`min-h-[88px] p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    selected
                      ? "bg-blue-600/20 border-blue-400 text-white"
                      : "bg-[#141E34] border-white/10 text-slate-300 hover:border-white/25"
                  }`}
                >
                  <GamerAvatarBadge avatarId={av.id} sizeClass="h-11 w-11" />
                  <span className="text-xs font-semibold">{av.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Livello & Personalità Coach */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-slate-300">Livello attuale</p>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onUpdateProfile({ level: lvl })}
                  className={`min-h-[48px] rounded-2xl text-sm font-bold cursor-pointer transition-colors ${
                    profile.level === lvl
                      ? "bg-blue-600 text-white"
                      : "bg-[#141E34] border border-white/10 text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-slate-300">
              Stile preferito di Coach Marco
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COACH_PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    onUpdateProfile({ coachPersonality: p.id as CoachPersonality })
                  }
                  className={`min-h-[48px] px-3 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                    profile.coachPersonality === p.id
                      ? "bg-violet-600 text-white"
                      : "bg-[#141E34] border border-white/10 text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Oggetti sbloccati nel Negozio XP */}
        {purchasedItemIds.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <p className="text-sm font-semibold text-slate-300">
              Personalizzazioni sbloccate con i tuoi XP
            </p>
            <div className="flex flex-wrap gap-2">
              {SHOP_ITEMS.filter((it) => purchasedItemIds.includes(it.id)).map(
                (item) => {
                  const isEquipped =
                    profile.equippedFrameId === item.id ||
                    profile.equippedBgId === item.id ||
                    profile.equippedBadgeId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.category === "cornice") {
                          onUpdateProfile({
                            equippedFrameId: isEquipped ? "" : item.id,
                          });
                        } else if (item.category === "sfondo") {
                          onUpdateProfile({
                            equippedBgId: isEquipped ? "" : item.id,
                          });
                        } else if (item.category === "badge") {
                          onUpdateProfile({
                            equippedBadgeId: isEquipped ? "" : item.id,
                          });
                        } else if (item.avatarId) {
                          onUpdateProfile({ avatarId: item.avatarId });
                        }
                      }}
                      className={`min-h-[44px] px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        isEquipped
                          ? "bg-emerald-600 text-white"
                          : "bg-[#141E34] border border-white/15 text-slate-200"
                      }`}
                    >
                      {item.name} · {isEquipped ? "Equipaggiato" : "Usa"}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
      </section>

      {/* Obiettivi personali & Punti deboli */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Obiettivi personali</h2>
          <form onSubmit={handleGoalSubmit} className="flex gap-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Aggiungi un tuo obiettivo personale..."
              className="flex-1 min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="min-h-[50px] px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Aggiungi
            </button>
          </form>

          <div className="divide-y divide-white/10">
            {profile.personalGoals.map((g) => (
              <div
                key={g.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onTogglePersonalGoal(g.id)}
                  className="flex items-center gap-3 text-left flex-1 min-h-[44px] cursor-pointer"
                >
                  {g.done ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500 shrink-0" />
                  )}
                  <span
                    className={`text-sm sm:text-base font-medium ${
                      g.done ? "text-slate-400 line-through" : "text-white"
                    }`}
                  >
                    {g.text}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Elimina obiettivo"
                  onClick={() => onDeletePersonalGoal(g.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Punti deboli individuati
          </h2>
          <p className="text-sm text-slate-400">
            Coach Marco aggiorna automaticamente questa lista quando analizzi partite o clip.
          </p>

          {profile.weaknesses.length === 0 ? (
            <p className="text-sm text-slate-300 rounded-2xl bg-[#141E34] p-4 border border-white/10">
              Nessun punto debole registrato finora. Racconta una partita a Coach Marco per iniziare.
            </p>
          ) : (
            <div className="space-y-2">
              {profile.weaknesses.map((w) => (
                <div
                  key={w}
                  className="rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-slate-200">{w}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveWeakness(w)}
                    className="min-h-[40px] px-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-300 cursor-pointer"
                  >
                    Risolto
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODALITÀ ACCESSIBILITÀ */}
      <section className="rounded-3xl bg-[#0F172A] border border-blue-500/30 p-6 sm:p-7 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              Modalità Accessibilità
            </h2>
            <p className="text-sm text-slate-400">
              Adatta dimensione testi, pulsanti, contrasto, colori e animazioni in tutta l'app
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-slate-300">
              Dimensione del testo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "normale", label: "Normale" },
                  { id: "grande", label: "Grande" },
                  { id: "molto-grande", label: "Molto grande" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateAccessibility({ textSize: t.id })}
                  className={`min-h-[48px] px-3 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                    accessibility.textSize === t.id
                      ? "bg-blue-600 text-white"
                      : "bg-[#141E34] border border-white/10 text-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-slate-300">
              Modalità colori
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "default", label: "Blu / Viola" },
                  { id: "daltonismo", label: "Daltonismo" },
                  { id: "contrasto", label: "Alto contrasto" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onUpdateAccessibility({ colorMode: c.id })}
                  className={`min-h-[48px] px-3 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                    accessibility.colorMode === c.id
                      ? "bg-violet-600 text-white"
                      : "bg-[#141E34] border border-white/10 text-slate-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              key: "bigButtons" as const,
              label: "Pulsanti extra grandi",
              value: accessibility.bigButtons,
            },
            {
              key: "highContrast" as const,
              label: "Contrasto elevato",
              value: accessibility.highContrast,
            },
            {
              key: "simplifiedUi" as const,
              label: "Interfaccia semplice",
              value: accessibility.simplifiedUi,
            },
            {
              key: "reduceMotion" as const,
              label: "Riduci animazioni",
              value: accessibility.reduceMotion,
            },
          ].map((toggle) => (
            <button
              key={toggle.key}
              type="button"
              onClick={() =>
                onUpdateAccessibility({ [toggle.key]: !toggle.value })
              }
              className={`min-h-[54px] px-4 rounded-2xl border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                toggle.value
                  ? "bg-blue-600/25 border-blue-400 text-white"
                  : "bg-[#141E34] border-white/10 text-slate-300"
              }`}
            >
              <span className="text-sm font-semibold">{toggle.label}</span>
              <span className="text-xs font-bold text-blue-300">
                {toggle.value ? "ON" : "OFF"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SALVATAGGIO LOCALE & PRIVACY */}
      <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              Privacy e Salvataggio Dati
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {storageRepository.description} Nessuna password richiesta, nessuna
              carta di credito, nessuna chat privata tra sconosciuti. L'architettura è
              già predisposta tramite repository modulare per un futuro collegamento a
              un database online.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExportData}
            className="min-h-[52px] px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Scarica Backup Dati (JSON)
          </button>

          {!confirmWipe ? (
            <button
              type="button"
              onClick={() => setConfirmWipe(true)}
              className="min-h-[52px] px-5 rounded-2xl bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 text-rose-200 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Cancella tutti i dati personali
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-rose-950/60 border border-rose-500/50 p-3">
              <span className="text-xs sm:text-sm text-rose-200 font-semibold px-2">
                Confermi di azzerare profilo, allenamenti, diario e chat?
              </span>
              <button
                type="button"
                onClick={() => {
                  onWipeAllData();
                  setConfirmWipe(false);
                }}
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Sì, cancella tutto
              </button>
              <button
                type="button"
                onClick={() => setConfirmWipe(false)}
                className="min-h-[44px] px-4 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
              >
                Annulla
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
