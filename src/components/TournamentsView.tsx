import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import type {
  CatalogGameItem,
  FoundTournament,
  GameId,
  GamerProfile,
  PersonalTournamentRecord,
  TournamentEntry,
} from "../types";
import {
  GAMES,
  TOURNAMENT_LEVELS,
  TOURNAMENT_MODES,
  TOURNAMENT_PLATFORMS,
  getDisplayGameName,
} from "../data/games";
import { GameEmblem } from "./GameEmblem";
import { GameCatalogModal } from "./GameCatalogModal";

interface TournamentsViewProps {
  profile: GamerProfile;
  activeGameId: GameId;
  customGameTitle: string;
  communityChallenges: TournamentEntry[];
  personalTournaments: PersonalTournamentRecord[];
  onToggleJoinChallenge: (id: string) => void;
  onRecordChallengeResult: (id: string, points: number) => void;
  onSavePersonalTournament: (record: PersonalTournamentRecord) => void;
  onUpdatePersonalTournament: (
    id: string,
    patch: Partial<PersonalTournamentRecord>
  ) => void;
  onDeletePersonalTournament: (id: string) => void;
}

type TournamentSubTab = "finder" | "personal" | "challenges" | "leaderboards";

const STATUS_STYLES: Record<FoundTournament["status"], string> = {
  "Iscrizioni aperte": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "In corso": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Concluso: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  "Verifica sulla fonte": "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  profile,
  activeGameId,
  customGameTitle,
  communityChallenges,
  personalTournaments,
  onToggleJoinChallenge,
  onRecordChallengeResult,
  onSavePersonalTournament,
  onUpdatePersonalTournament,
  onDeletePersonalTournament,
}) => {
  const [subTab, setSubTab] = useState<TournamentSubTab>("finder");

  // Tournament Finder Filters
  const [gameId, setGameId] = useState<GameId>(activeGameId);
  const [customFinderGame, setCustomFinderGame] = useState<string>(customGameTitle);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mode, setMode] = useState<string>("Tutte");
  const [level, setLevel] = useState<string>("Tutti");
  const [platform, setPlatform] = useState<string>("Tutte");
  const [locationType, setLocationType] = useState<"Online" | "Locale">("Online");
  const [localArea, setLocalArea] = useState("");

  // Search results state
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [foundTournaments, setFoundTournaments] = useState<FoundTournament[]>([]);
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);

  // Challenges score inputs
  const [challengeScores, setChallengeScores] = useState<Record<string, string>>({});

  // Personal tournament result editor
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultPlacement, setResultPlacement] = useState("");
  const [resultScore, setResultScore] = useState("");
  const [resultMatches, setResultMatches] = useState("1");
  const [resultNotes, setResultNotes] = useState("");

  // Leaderboard filters
  const [lbGameFilter, setLbGameFilter] = useState<GameId | "ALL">("ALL");
  const [lbTournamentFilter, setLbTournamentFilter] = useState<string>("ALL");

  const chosenGameName = getDisplayGameName(gameId, customFinderGame);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchMessage(null);

    try {
      const res = await fetch("/api/tournaments/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: chosenGameName,
          mode,
          level,
          platform,
          locationType,
          localArea: locationType === "Locale" ? localArea.trim() : "",
        }),
      });

      const data = (await res.json()) as {
        available?: boolean;
        tournaments?: FoundTournament[];
        sources?: Array<{ title: string; url: string }>;
        message?: string;
        lastUpdated?: string;
      };

      setLastUpdated(data.lastUpdated || new Date().toLocaleString("it-IT"));
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setFoundTournaments(Array.isArray(data.tournaments) ? data.tournaments : []);
      setSearchMessage(
        data.message ||
          (data.tournaments && data.tournaments.length > 0
            ? "Tornei caricati da fonti ufficiali verificate."
            : `Nessun torneo verificabile trovato al momento per ${chosenGameName}.`)
      );

      if (!res.ok && !data.message) {
        throw new Error("Impossibile completare la ricerca tornei in questo momento.");
      }
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : "Errore temporaneo durante la ricerca dei tornei."
      );
      setFoundTournaments([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavoriteFromFinder = (t: FoundTournament) => {
    const existing = personalTournaments.find(
      (p) => p.tournamentId === t.id || p.name.toLowerCase() === t.name.toLowerCase()
    );
    if (existing) {
      onUpdatePersonalTournament(existing.id, {
        isFavorite: !existing.isFavorite,
      });
    } else {
      onSavePersonalTournament({
        id: `pt-${Date.now()}`,
        tournamentId: t.id,
        name: t.name,
        gameId,
        gameName: t.gameName,
        dateTime: t.dateTime,
        mode: t.mode,
        platform: t.platform,
        officialUrl: t.officialUrl,
        isFavorite: true,
        isUpcoming: false,
      });
    }
  };

  const toggleUpcomingFromFinder = (t: FoundTournament) => {
    const existing = personalTournaments.find(
      (p) => p.tournamentId === t.id || p.name.toLowerCase() === t.name.toLowerCase()
    );
    if (existing) {
      onUpdatePersonalTournament(existing.id, {
        isUpcoming: !existing.isUpcoming,
      });
    } else {
      onSavePersonalTournament({
        id: `pt-${Date.now()}`,
        tournamentId: t.id,
        name: t.name,
        gameId,
        gameName: t.gameName,
        dateTime: t.dateTime,
        mode: t.mode,
        platform: t.platform,
        officialUrl: t.officialUrl,
        isFavorite: true,
        isUpcoming: true,
      });
    }
  };

  const favoriteList = personalTournaments.filter((t) => t.isFavorite);
  const upcomingList = personalTournaments.filter((t) => t.isUpcoming && !t.completedAt);
  const historyList = personalTournaments.filter((t) => Boolean(t.completedAt));

  // Real verified leaderboard entries (from personal history + local community challenges)
  const leaderboardEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      tournamentName: string;
      gameId: GameId;
      gameName: string;
      player: string;
      score: number;
      detail: string;
      dateLabel: string;
    }> = [];

    for (const ch of communityChallenges) {
      if (ch.recordedScore !== null) {
        const gObj = GAMES.find((g) => g.id === ch.gameId);
        entries.push({
          id: `lb-ch-${ch.id}`,
          tournamentName: ch.title,
          gameId: ch.gameId,
          gameName: gObj?.name || "Gioco",
          player: profile.nickname,
          score: ch.recordedScore,
          detail: `${ch.recordedMatches} partite registrate`,
          dateLabel: "Sfida locale verificata",
        });
      }
    }

    for (const pt of historyList) {
      if (typeof pt.score === "number") {
        entries.push({
          id: `lb-pt-${pt.id}`,
          tournamentName: pt.name,
          gameId: pt.gameId,
          gameName: pt.gameName,
          player: profile.nickname,
          score: pt.score,
          detail: pt.placement ? `Piazzamento: ${pt.placement}` : "Risultato registrato",
          dateLabel: pt.completedAt || "",
        });
      }
    }

    return entries
      .filter((e) => (lbGameFilter === "ALL" ? true : e.gameId === lbGameFilter))
      .filter((e) =>
        lbTournamentFilter === "ALL" ? true : e.tournamentName === lbTournamentFilter
      )
      .sort((a, b) => b.score - a.score);
  }, [
    communityChallenges,
    historyList,
    profile.nickname,
    lbGameFilter,
    lbTournamentFilter,
  ]);

  const distinctTournamentNames = useMemo(() => {
    const names = new Set<string>();
    communityChallenges.forEach((c) => names.add(c.title));
    historyList.forEach((h) => names.add(h.name));
    return Array.from(names);
  }, [communityChallenges, historyList]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-400 inline-flex items-center gap-2">
            <Swords className="w-4 h-4" />
            100% Gratuito · Fonti Ufficiali & Sicurezza Minori
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
            Tornei & Tournament Finder
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
            Cerca competizioni verificabili per gioco, modalità, livello e
            piattaforma, gestisci i tuoi tornei e registra risultati reali.
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-2xl bg-[#0F172A] border border-white/10 p-2">
        <button
          type="button"
          onClick={() => setSubTab("finder")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "finder"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Search className="w-4 h-4 shrink-0" />
          Tournament Finder
        </button>

        <button
          type="button"
          onClick={() => setSubTab("personal")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "personal"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Bookmark className="w-4 h-4 shrink-0" />
          I Miei Tornei ({personalTournaments.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab("challenges")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "challenges"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          Sfide Giornaliere
        </button>

        <button
          type="button"
          onClick={() => setSubTab("leaderboards")}
          className={`min-h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            subTab === "leaderboards"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          Classifiche Reali
        </button>
      </div>

      {/* 1. TOURNAMENT FINDER */}
      {subTab === "finder" && (
        <div className="space-y-6">
          {/* Safety & Free Banner */}
          <section className="rounded-2xl bg-[#0F172A] border border-emerald-500/30 p-4 sm:p-5 flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 space-y-1">
              <p className="font-bold text-white">
                Ricerca gratuita da fonti ufficiali · Zero dati personali richiesti
              </p>
              <p>
                Tournament Finder cerca esclusivamente su pagine ufficiali e portali
                verificati. Non inventa mai tornei, date, premi o link, non richiede
                pagamenti né contatti privati con sconosciuti, e segnala sempre
                eventuali limiti di età.
              </p>
            </div>
          </section>

          {/* Filters Form */}
          <form
            onSubmit={handleSearch}
            className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
              <Filter className="w-4 h-4" />
              Filtra i tornei disponibili
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="tf-game" className="text-xs font-semibold text-slate-300 block">
                    Gioco
                  </label>
                  <button
                    type="button"
                    onClick={() => setCatalogOpen(true)}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    + Cerca tra 5.500+ giochi
                  </button>
                </div>
                <select
                  id="tf-game"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value as GameId)}
                  className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                >
                  {GAMES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.id === "altri" && customFinderGame
                        ? customFinderGame
                        : g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tf-mode" className="text-xs font-semibold text-slate-300 block">
                  Modalità
                </label>
                <select
                  id="tf-mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                >
                  {TOURNAMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tf-level" className="text-xs font-semibold text-slate-300 block">
                  Livello
                </label>
                <select
                  id="tf-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                >
                  {TOURNAMENT_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tf-platform" className="text-xs font-semibold text-slate-300 block">
                  Piattaforma
                </label>
                <select
                  id="tf-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                >
                  {TOURNAMENT_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-300">
                  Tipo di torneo
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["Online", "Locale"] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocationType(loc)}
                      className={`min-h-[50px] rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        locationType === loc
                          ? "bg-violet-600 text-white"
                          : "bg-[#141E34] border border-white/15 text-slate-300"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {locationType === "Locale" && (
                <div className="space-y-1.5">
                  <label htmlFor="tf-area" className="text-xs font-semibold text-slate-300 block">
                    Città o Regione (solo per cercare eventi pubblici)
                  </label>
                  <input
                    id="tf-area"
                    type="text"
                    maxLength={40}
                    value={localArea}
                    onChange={(e) => setLocalArea(e.target.value)}
                    placeholder="Es. Milano, Roma, Italia..."
                    className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto min-h-[54px] px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-white font-bold text-base inline-flex items-center justify-center gap-2.5 cursor-pointer transition-all"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ricerca su fonti ufficiali...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Cerca Tornei per {chosenGameName}
                </>
              )}
            </button>
          </form>

          {searchError && (
            <div
              role="alert"
              className="rounded-2xl bg-rose-950/50 border border-rose-500/40 p-5 flex items-start gap-3 text-rose-200 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>{searchError}</span>
            </div>
          )}

          {searchMessage && (
            <div className="rounded-2xl bg-[#0F172A] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm sm:text-base text-slate-200">{searchMessage}</p>
              {lastUpdated && (
                <span className="text-xs font-mono text-blue-400 tabular-nums">
                  Ultimo aggiornamento: {lastUpdated}
                </span>
              )}
            </div>
          )}

          {/* Tournament Cards */}
          {foundTournaments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {foundTournaments.map((t) => {
                const savedItem = personalTournaments.find(
                  (p) =>
                    p.tournamentId === t.id ||
                    p.name.toLowerCase() === t.name.toLowerCase()
                );
                return (
                  <article
                    key={t.id}
                    className="rounded-3xl bg-[#0F172A] border border-white/15 p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`px-3 py-1 rounded-xl border text-xs font-bold ${
                            STATUS_STYLES[t.status]
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums">
                          Aggiornato: {t.lastUpdated}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <GameEmblem
                          gameId={gameId}
                          className="w-7 h-7 text-blue-400 shrink-0 mt-0.5"
                        />
                        <div>
                          <h2 className="text-xl font-bold text-white">{t.name}</h2>
                          <p className="text-xs font-semibold text-violet-300 mt-0.5">
                            {t.gameName} · {t.mode} · {t.platform} · {t.locationType}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                        <div className="rounded-xl bg-[#141E34] border border-white/5 p-3">
                          <p className="text-slate-400 font-semibold">Data e orario</p>
                          <p className="text-white font-medium mt-0.5">{t.dateTime}</p>
                        </div>
                        <div className="rounded-xl bg-[#141E34] border border-white/5 p-3">
                          <p className="text-slate-400 font-semibold">Partecipanti</p>
                          <p className="text-white font-medium mt-0.5">{t.participants}</p>
                        </div>
                        <div className="rounded-xl bg-[#141E34] border border-white/5 p-3">
                          <p className="text-slate-400 font-semibold">Premi</p>
                          <p className="text-emerald-300 font-medium mt-0.5">{t.prizes}</p>
                        </div>
                        <div className="rounded-xl bg-[#141E34] border border-white/5 p-3">
                          <p className="text-slate-400 font-semibold">Requisiti</p>
                          <p className="text-white font-medium mt-0.5">{t.requirements}</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-amber-950/35 border border-amber-500/35 p-3 flex items-start gap-2.5 text-xs text-amber-200">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Limiti di età e regolamento</p>
                          <p className="mt-0.5">
                            {t.ageLimit} — {t.rules}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleFavoriteFromFinder(t)}
                          className={`min-h-[46px] px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            savedItem?.isFavorite
                              ? "bg-violet-600 text-white"
                              : "bg-[#141E34] border border-white/15 text-slate-200 hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                          {savedItem?.isFavorite ? "Nei Preferiti" : "Salva Preferito"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleUpcomingFromFinder(t)}
                          className={`min-h-[46px] px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            savedItem?.isUpcoming
                              ? "bg-emerald-600 text-white"
                              : "bg-[#141E34] border border-white/15 text-slate-200 hover:text-white"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          {savedItem?.isUpcoming ? "Nei Prossimi" : "Segna Iscritto"}
                        </button>
                      </div>

                      {t.officialUrl ? (
                        <a
                          href={t.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>Vai alla Pagina Ufficiale ({t.sourceName})</span>
                          <ExternalLink className="w-4 h-4 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-2">
                          Nessun link di iscrizione diretto verificato disponibile.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {sources.length > 0 && (
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-5 space-y-3">
              <p className="text-xs font-bold text-slate-400">
                Fonti ufficiali consultate nella ricerca ({sources.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#141E34] border border-white/10 hover:border-blue-400 text-xs font-semibold text-blue-300 flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{src.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TORNEI PERSONALI */}
      {subTab === "personal" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Prossimi tornei & Preferiti */}
            <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Preferiti & Prossimi Tornei ({favoriteList.length + upcomingList.length})
              </h2>
              {personalTournaments.filter((t) => !t.completedAt).length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nessun torneo salvato ancora. Usa il Tournament Finder per salvare
                  tornei preferiti o segnare le tue prossime gare.
                </p>
              ) : (
                <div className="space-y-3">
                  {personalTournaments
                    .filter((t) => !t.completedAt)
                    .map((pt) => (
                      <div
                        key={pt.id}
                        className="rounded-2xl bg-[#141E34] border border-white/10 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-blue-400">
                              {pt.gameName} · {pt.mode} · {pt.platform}
                              {pt.isUpcoming ? " · In programma" : " · Preferito"}
                            </p>
                            <h3 className="text-lg font-bold text-white mt-0.5">
                              {pt.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {pt.dateTime}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label="Rimuovi torneo"
                            onClick={() => onDeletePersonalTournament(pt.id)}
                            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-400 hover:text-rose-400 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {editingResultId === pt.id ? (
                          <div className="rounded-xl bg-[#0B101D] border border-violet-500/40 p-3.5 space-y-2.5">
                            <p className="text-xs font-bold text-violet-300">
                              Registra il risultato reale ottenuto
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={resultPlacement}
                                onChange={(e) => setResultPlacement(e.target.value)}
                                placeholder="Es. 3° posto"
                                className="min-h-[42px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-xs text-white"
                              />
                              <input
                                type="number"
                                min={0}
                                value={resultScore}
                                onChange={(e) => setResultScore(e.target.value)}
                                placeholder="Punti"
                                className="min-h-[42px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-xs text-white tabular-nums"
                              />
                              <input
                                type="number"
                                min={1}
                                value={resultMatches}
                                onChange={(e) => setResultMatches(e.target.value)}
                                placeholder="Partite"
                                className="min-h-[42px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-xs text-white tabular-nums"
                              />
                            </div>
                            <input
                              type="text"
                              value={resultNotes}
                              onChange={(e) => setResultNotes(e.target.value)}
                              placeholder="Note sulla prestazione..."
                              className="w-full min-h-[42px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-xs text-white"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const numScore = Number(resultScore);
                                  onUpdatePersonalTournament(pt.id, {
                                    placement: resultPlacement.trim() || "Completato",
                                    score: Number.isFinite(numScore) ? numScore : 0,
                                    matchesPlayed: Math.max(1, Number(resultMatches) || 1),
                                    notes: resultNotes.trim(),
                                    completedAt: new Date().toLocaleDateString("it-IT"),
                                    isUpcoming: false,
                                  });
                                  setEditingResultId(null);
                                  setResultPlacement("");
                                  setResultScore("");
                                  setResultNotes("");
                                }}
                                className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                              >
                                Salva Risultato
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingResultId(null)}
                                className="min-h-[42px] px-3 rounded-xl bg-white/10 text-slate-200 text-xs font-bold cursor-pointer"
                              >
                                Annulla
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingResultId(pt.id)}
                              className="min-h-[44px] px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Segna Risultato
                            </button>
                            {pt.officialUrl && (
                              <a
                                href={pt.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[44px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-blue-300 text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                Pagina Ufficiale
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Cronologia personale */}
            <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Cronologia Tornei ({historyList.length})
              </h2>
              {historyList.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nessun torneo concluso registrato nella cronologia personale.
                </p>
              ) : (
                <div className="space-y-3">
                  {historyList.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-2xl bg-[#141E34] border border-emerald-500/30 p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-400">
                          {h.gameName} · {h.completedAt}
                        </span>
                        <span className="font-mono text-xs font-bold text-white tabular-nums">
                          {h.score ?? 0} pt · {h.placement}
                        </span>
                      </div>
                      <h3 className="font-bold text-white">{h.name}</h3>
                      {h.notes && (
                        <p className="text-xs text-slate-300">{h.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* 3. SFIDE COMMUNITY LOCALI */}
      {subTab === "challenges" && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-[#0F172A] border border-blue-500/30 p-6 space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Sfide Giornaliere & Settimanali Community
            </h2>
            <p className="text-sm text-slate-300">
              Sfide gratuite interne a GAMECOACH AI per allenarti con obiettivi reali e
              guadagnare XP extra per il Negozio Cosmetici.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {communityChallenges.map((t) => {
              const gameObj = GAMES.find((g) => g.id === t.gameId);
              return (
                <div
                  key={t.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between gap-5 ${
                    t.joined
                      ? "bg-[#15223D] border-blue-500"
                      : "bg-[#0F172A] border-white/10"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-violet-300">
                        {t.cadence} · {t.format}
                      </span>
                      <span className="text-blue-400">{gameObj?.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <GameEmblem gameId={t.gameId} className="w-7 h-7 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">{t.title}</h3>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {t.description}
                    </p>

                    <p className="text-xs font-bold text-emerald-400 inline-flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Premio virtuale: {t.prizeLabel}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => onToggleJoinChallenge(t.id)}
                      className={`w-full min-h-[48px] rounded-2xl font-bold text-sm cursor-pointer transition-colors ${
                        t.joined
                          ? "bg-white/10 hover:bg-rose-600/30 text-white"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {t.joined ? "Iscritto · Ritirati" : "Partecipa alla Sfida"}
                    </button>

                    {t.joined && (
                      <div className="space-y-2.5">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={0}
                            max={10000}
                            value={challengeScores[t.id] ?? ""}
                            onChange={(e) =>
                              setChallengeScores((prev) => ({
                                ...prev,
                                [t.id]: e.target.value,
                              }))
                            }
                            placeholder="Punteggio partita"
                            className="flex-1 min-h-[44px] rounded-xl bg-[#0B101D] border border-white/15 px-3 text-sm text-white tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = Number(challengeScores[t.id]);
                              if (!Number.isFinite(val) || val < 0) return;
                              onRecordChallengeResult(t.id, val);
                              setChallengeScores((prev) => ({ ...prev, [t.id]: "" }));
                            }}
                            className="min-h-[44px] px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Registra
                          </button>
                        </div>

                        <div className="rounded-xl bg-[#0B101D] border border-white/10 p-3 text-xs space-y-1">
                          <p className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            Risultato Locale Registrato
                          </p>
                          {t.recordedScore === null ? (
                            <p className="text-slate-400">
                              {profile.nickname}: iscritto · nessuna partita registrata.
                            </p>
                          ) : (
                            <p className="text-emerald-300 font-semibold flex items-center gap-1.5 tabular-nums">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {profile.nickname} — {t.recordedScore} pt ({t.recordedMatches} partite)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CLASSIFICHE REALI */}
      {subTab === "leaderboards" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Classifiche per Gioco e Torneo (Solo Risultati Reali)
            </h2>
            <p className="text-sm text-slate-300">
              Vengono mostrati esclusivamente risultati reali registrati e verificati.
              Nessun punteggio o partecipante viene mai generato automaticamente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                aria-label="Filtra classifica per gioco"
                value={lbGameFilter}
                onChange={(e) => setLbGameFilter(e.target.value as GameId | "ALL")}
                className="min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm text-white"
              >
                <option value="ALL">Tutti i giochi</option>
                {GAMES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filtra classifica per torneo"
                value={lbTournamentFilter}
                onChange={(e) => setLbTournamentFilter(e.target.value)}
                className="min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm text-white"
              >
                <option value="ALL">Tutti i tornei</option>
                {distinctTournamentNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {leaderboardEntries.length === 0 ? (
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 text-center space-y-2">
              <p className="text-lg font-semibold text-white">
                Nessun risultato verificato in classifica ancora
              </p>
              <p className="text-sm text-slate-400">
                Registra il risultato di un tuo torneo personale o partecipa alle Sfide
                Giornaliere per apparire in classifica con punteggi reali.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/10">
                {leaderboardEntries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 font-mono font-extrabold flex items-center justify-center tabular-nums">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white">{entry.player}</p>
                        <p className="text-xs text-slate-400">
                          {entry.tournamentName} · {entry.gameName} · {entry.detail}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-xl font-extrabold text-emerald-400 tabular-nums">
                        {entry.score} pt
                      </p>
                      <p className="text-xs text-slate-500">{entry.dateLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GameCatalogModal
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        title="Scegli un gioco per il Tournament Finder (5.500+ titoli)"
        onSelectCatalogGame={(item: CatalogGameItem) => {
          setGameId("altri");
          setCustomFinderGame(item.name);
        }}
      />
    </div>
  );
};
