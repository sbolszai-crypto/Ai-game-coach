import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Flag,
  Gamepad2,
  Globe,
  HardDriveDownload,
  Heart,
  Loader2,
  Play,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react";
import type {
  ArcadeGameItem,
  ArcadeReportItem,
  GameCheckResult,
  InstantPlayId,
} from "../types";
import { ArcadeGamePlayerModal } from "./ArcadeMiniGames";

type ArcadeTab = "all" | "online" | "offline" | "apk" | "favorites" | "gamecheck";

interface ArcadeViewProps {
  favorites: string[];
  ratings: Record<string, number>;
  reports: ArcadeReportItem[];
  onToggleFavorite: (gameId: string) => void;
  onRateGame: (gameId: string, stars: number) => void;
  onSubmitReport: (report: Omit<ArcadeReportItem, "id" | "createdAt" | "status">) => void;
}

const NATIVE_ONLINE_GAMES: ArcadeGameItem[] = [
  {
    id: "native-aim-grid",
    title: "Reflex Aim Grid",
    category: "online",
    genre: "Mira & Riflessi",
    developer: "GAMECOACH Arcade HTML5",
    description:
      "Sfida browser da 30 secondi con bersagli reattivi su Canvas HTML5 per misurare precisione e tempi di reazione reali in millisecondi.",
    imageUrl: "/src/assets/images/arcade_browser_play_1794856575256.jpg",
    requiresInternet: false,
    worksOffline: true,
    multiplayer: false,
    instantPlayMode: "native",
    instantPlayId: "aim",
    officialUrl: "",
    sourceName: "Integrato in GAMECOACH Arcade",
    sourceDomain: "gamecoach.local",
    verifiedSource: true,
    apkAvailable: false,
    platformLabel: "Browser HTML5 · Avvio Immediato",
    requirements: "Funziona direttamente nel browser su PC, Tablet e Android",
  },
  {
    id: "native-neon-snake",
    title: "Neon Snake Classic",
    category: "online",
    genre: "Arcade Classico",
    developer: "GAMECOACH Arcade HTML5",
    description:
      "Classico Snake su griglia scura giocabile all'istante con tastiera o pulsanti touch dedicati per allenare coordinazione e riflessi.",
    imageUrl: "/src/assets/images/arcade_browser_play_1794856575256.jpg",
    requiresInternet: false,
    worksOffline: true,
    multiplayer: false,
    instantPlayMode: "native",
    instantPlayId: "snake",
    officialUrl: "",
    sourceName: "Integrato in GAMECOACH Arcade",
    sourceDomain: "gamecoach.local",
    verifiedSource: true,
    apkAvailable: false,
    platformLabel: "Browser HTML5 · Avvio Immediato",
    requirements: "Tastiera o touch screen · Zero download",
  },
  {
    id: "native-2048",
    title: "2048 Arcade Neon",
    category: "online",
    genre: "Puzzle & Strategia",
    developer: "GAMECOACH Arcade HTML5",
    description:
      "Puzzle numerico 4x4 per allenare pianificazione tattica e gestione degli spazi direttamente dalla scheda browser.",
    imageUrl: "/src/assets/images/arcade_browser_play_1794856575256.jpg",
    requiresInternet: false,
    worksOffline: true,
    multiplayer: false,
    instantPlayMode: "native",
    instantPlayId: "2048",
    officialUrl: "",
    sourceName: "Integrato in GAMECOACH Arcade",
    sourceDomain: "gamecoach.local",
    verifiedSource: true,
    apkAvailable: false,
    platformLabel: "Browser HTML5 · Avvio Immediato",
    requirements: "PC, Tablet e Smartphone · Avvio istantaneo",
  },
  {
    id: "native-memory",
    title: "Cyber Memory Match",
    category: "online",
    genre: "Memoria & Focus",
    developer: "GAMECOACH Arcade HTML5",
    description:
      "Gioco rapido di memoria visiva a 16 tessere per scaldare la concentrazione prima di una sessione competitiva.",
    imageUrl: "/src/assets/images/arcade_browser_play_1794856575256.jpg",
    requiresInternet: false,
    worksOffline: true,
    multiplayer: false,
    instantPlayMode: "native",
    instantPlayId: "memory",
    officialUrl: "",
    sourceName: "Integrato in GAMECOACH Arcade",
    sourceDomain: "gamecoach.local",
    verifiedSource: true,
    apkAvailable: false,
    platformLabel: "Browser HTML5 · Avvio Immediato",
    requirements: "PC, Tablet e Smartphone · Avvio istantaneo",
  },
];

export const ArcadeView: React.FC<ArcadeViewProps> = ({
  favorites,
  ratings,
  reports,
  onToggleFavorite,
  onRateGame,
  onSubmitReport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ArcadeTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("Tutti");
  const [multiplayerFilter, setMultiplayerFilter] = useState<"all" | "multi" | "solo">("all");

  const [onlineExternal, setOnlineExternal] = useState<ArcadeGameItem[]>([]);
  const [offlineGames, setOfflineGames] = useState<ArcadeGameItem[]>([]);
  const [apkGames, setApkGames] = useState<ArcadeGameItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Instant-play modal
  const [playingNative, setPlayingNative] = useState<{
    id: InstantPlayId;
    title: string;
  } | null>(null);

  // Selected Game Detail / APK Safe Download Inspection Modal
  const [selectedItem, setSelectedItem] = useState<ArcadeGameItem | null>(null);
  const [apkCheckLoading, setApkCheckLoading] = useState(false);
  const [apkCheckResult, setApkCheckResult] = useState<GameCheckResult | null>(null);

  // GameCheck Standalone Inspector
  const [checkUrlInput, setCheckUrlInput] = useState("");
  const [checkTitleInput, setCheckTitleInput] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<GameCheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Report Form
  const [reportTitle, setReportTitle] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [reportReason, setReportReason] = useState("Link o file APK non verificato / sospetto");
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingCatalog(true);
    fetch("/api/arcade")
      .then((res) => {
        if (!res.ok) throw new Error("Impossibile caricare il catalogo Arcade.");
        return res.json();
      })
      .then(
        (data: {
          onlineGames?: ArcadeGameItem[];
          offlineGames?: ArcadeGameItem[];
          apkGames?: ArcadeGameItem[];
        }) => {
          if (!active) return;
          setOnlineExternal(Array.isArray(data.onlineGames) ? data.onlineGames : []);
          setOfflineGames(Array.isArray(data.offlineGames) ? data.offlineGames : []);
          setApkGames(Array.isArray(data.apkGames) ? data.apkGames : []);
          setCatalogError(null);
        }
      )
      .catch((err) => {
        if (active) {
          setCatalogError(
            err instanceof Error
              ? err.message
              : "Errore durante il caricamento dello store Arcade."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingCatalog(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allItems = useMemo(
    () => [...NATIVE_ONLINE_GAMES, ...onlineExternal, ...offlineGames, ...apkGames],
    [onlineExternal, offlineGames, apkGames]
  );

  const distinctGenres = useMemo(() => {
    const base =
      activeSubTab === "online"
        ? [...NATIVE_ONLINE_GAMES, ...onlineExternal]
        : activeSubTab === "offline"
          ? offlineGames
          : activeSubTab === "apk"
            ? apkGames
            : allItems;
    return ["Tutti", ...Array.from(new Set(base.map((g) => g.genre))).sort()];
  }, [activeSubTab, onlineExternal, offlineGames, apkGames, allItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let pool: ArcadeGameItem[];
    if (activeSubTab === "online") {
      pool = [...NATIVE_ONLINE_GAMES, ...onlineExternal];
    } else if (activeSubTab === "offline") {
      pool = offlineGames;
    } else if (activeSubTab === "apk") {
      pool = apkGames;
    } else if (activeSubTab === "favorites") {
      pool = allItems.filter((g) => favorites.includes(g.id));
    } else {
      pool = allItems;
    }

    return pool.filter((item) => {
      if (genreFilter !== "Tutti" && item.genre !== genreFilter) return false;
      if (multiplayerFilter === "multi" && !item.multiplayer) return false;
      if (multiplayerFilter === "solo" && item.multiplayer) return false;
      if (q) {
        const hay = `${item.title} ${item.genre} ${item.developer} ${item.sourceName} ${item.packageName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    activeSubTab,
    onlineExternal,
    offlineGames,
    apkGames,
    allItems,
    favorites,
    genreFilter,
    multiplayerFilter,
    searchQuery,
  ]);

  const runGameCheck = async (url: string, title = "") => {
    const res = await fetch("/api/arcade/gamecheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title }),
    });
    const data = (await res.json()) as GameCheckResult & { error?: string };
    if (!res.ok && data.error) {
      throw new Error(data.error);
    }
    return data;
  };

  const handleInspectItem = async (item: ArcadeGameItem) => {
    setSelectedItem(item);
    setApkCheckResult(null);
    const targetUrl = item.apkDownloadUrl || item.officialUrl || item.storePageUrl;
    if (!targetUrl) return;
    setApkCheckLoading(true);
    try {
      const checked = await runGameCheck(targetUrl, item.title);
      setApkCheckResult(checked);
    } catch {
      setApkCheckResult(null);
    } finally {
      setApkCheckLoading(false);
    }
  };

  const handleStandaloneGameCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkLoading || !checkUrlInput.trim()) return;
    setCheckLoading(true);
    setCheckError(null);
    setCheckResult(null);
    try {
      const data = await runGameCheck(checkUrlInput.trim(), checkTitleInput.trim());
      setCheckResult(data);
    } catch (err) {
      setCheckError(
        err instanceof Error
          ? err.message
          : "Impossibile completare la verifica provenienza."
      );
    } finally {
      setCheckLoading(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() && !reportUrl.trim()) return;
    onSubmitReport({
      targetTitle: reportTitle.trim() || "File o gioco segnalato",
      targetUrl: reportUrl.trim() || "Non specificato",
      reason: reportReason,
    });
    setReportTitle("");
    setReportUrl("");
    setReportFeedback(
      "Segnalazione registrata in GameCheck: il contenuto resta contrassegnato per controllo sicurezza."
    );
  };

  const getFallbackThumb = (item: ArcadeGameItem) => {
    if (item.category === "online") {
      return "/src/assets/images/arcade_browser_play_1794856575256.jpg";
    }
    if (item.category === "apk") {
      return "/src/assets/images/arcade_gamecheck_shield_1794856582182.jpg";
    }
    return "/src/assets/images/arcade_offline_indie_1794856575926.jpg";
  };

  const categoryLabel = (cat: ArcadeGameItem["category"]) => {
    if (cat === "online") return "Online Games";
    if (cat === "offline") return "Offline Games";
    return "APK Store";
  };

  return (
    <div className="space-y-8">
      {/* Mini-Store Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A]">
        <img
          src="/src/assets/images/arcade_hero_banner_1794856576162.jpg"
          alt="GAMECOACH Arcade Store"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B14] via-[#070B14]/85 to-[#070B14]/65" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold text-blue-400">
              Mini-Store Gaming Gratuito · Fonti Ufficiali & Protezione GameCheck
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight [text-wrap:balance]">
              GAMECOACH ARCADE
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Gioca subito nel browser, scopri titoli Android e indie utilizzabili
              offline e consulta pacchetti APK esclusivamente da repository ufficiali
              verificati. Nessun file piratato, nessuna installazione automatica.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0 text-center">
            <div className="rounded-2xl bg-[#0B101D]/90 border border-white/10 px-4 py-3">
              <p className="font-mono text-xl font-extrabold text-white tabular-nums">
                {NATIVE_ONLINE_GAMES.length + onlineExternal.length}
              </p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
            <div className="rounded-2xl bg-[#0B101D]/90 border border-white/10 px-4 py-3">
              <p className="font-mono text-xl font-extrabold text-white tabular-nums">
                {offlineGames.length}
              </p>
              <p className="text-xs text-slate-400">Offline</p>
            </div>
            <div className="rounded-2xl bg-[#0B101D]/90 border border-white/10 px-4 py-3">
              <p className="font-mono text-xl font-extrabold text-white tabular-nums">
                {apkGames.filter((a) => a.apkAvailable).length}
              </p>
              <p className="text-xs text-slate-400">APK Ufficiali</p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Category Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 rounded-2xl bg-[#0F172A] border border-white/10 p-2">
        {(
          [
            { id: "all", label: "Tutto il Catalogo", icon: Gamepad2 },
            { id: "online", label: "Online Games", icon: Globe },
            { id: "offline", label: "Offline Games", icon: WifiOff },
            { id: "apk", label: "APK Store", icon: HardDriveDownload },
            { id: "favorites", label: `Preferiti (${favorites.length})`, icon: Heart },
            { id: "gamecheck", label: "GameCheck", icon: ShieldCheck },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id);
                setGenreFilter("Tutti");
              }}
              className={`min-h-[46px] px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                active
                  ? tab.id === "gamecheck"
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* GAMECHECK DEDICATED VIEW */}
      {activeSubTab === "gamecheck" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 flex flex-col">
              <div className="relative h-48 sm:h-56 bg-[#080E1C]">
                <img
                  src="/src/assets/images/arcade_gamecheck_shield_1794856582182.jpg"
                  alt="GameCheck Verifica Provenienza"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              </div>
              <div className="p-6 space-y-3 flex-1">
                <h2 className="text-2xl font-bold text-white">
                  GameCheck · Verifica Provenienza
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Controlla l&apos;autenticità del dominio di un download, la
                  cifratura HTTPS e lo stato HTTP della fonte ufficiale prima di
                  aprire qualsiasi pagina di scaricamento.
                </p>
                <div className="rounded-2xl bg-amber-950/35 border border-amber-500/35 p-4 text-xs text-amber-200 space-y-1.5">
                  <p className="font-bold inline-flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    Trasparenza Sicurezza (Nessun Antivirus Simulato)
                  </p>
                  <p>
                    GameCheck verifica la provenienza e le fonti autorizzate, ma{" "}
                    <strong>NON esegue scansioni antivirus locali</strong> sui file
                    del tuo dispositivo e non sostituisce Google Play Protect o un
                    antivirus reale.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* URL Checker Form */}
              <form
                onSubmit={handleStandaloneGameCheck}
                className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
              >
                <h3 className="text-xl font-bold text-white">
                  Controlla Provenienza Link o URL APK
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={checkTitleInput}
                    onChange={(e) => setCheckTitleInput(e.target.value)}
                    placeholder="Nome gioco (opzionale)"
                    className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-4 text-sm text-white placeholder:text-slate-500"
                  />
                  <input
                    type="url"
                    required
                    value={checkUrlInput}
                    onChange={(e) => setCheckUrlInput(e.target.value)}
                    placeholder="https://f-droid.org/repo/..."
                    className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-4 text-sm text-white placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={checkLoading || !checkUrlInput.trim()}
                  className="min-h-[48px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  {checkLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Controllo provenienza in corso...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verifica con GameCheck
                    </>
                  )}
                </button>

                {checkError && (
                  <p className="text-sm text-rose-400 font-semibold">{checkError}</p>
                )}

                {checkResult && (
                  <div
                    className={`rounded-2xl border p-4 space-y-2.5 text-sm ${
                      checkResult.provenanceStatus === "VERIFICATO"
                        ? "bg-emerald-950/35 border-emerald-500/40"
                        : checkResult.provenanceStatus === "SOSPETTO"
                          ? "bg-rose-950/40 border-rose-500/45"
                          : "bg-amber-950/35 border-amber-500/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-white">
                        Esito: {checkResult.provenanceStatus} · {checkResult.domain}
                      </span>
                      <span className="text-xs text-slate-400 tabular-nums">
                        {checkResult.checkedAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">
                      Fonte: {checkResult.officialSourceLabel} · HTTPS:{" "}
                      {checkResult.isHttps ? "Attivo" : "Assente"}
                      {checkResult.httpStatus !== null &&
                        ` · Stato HTTP: ${checkResult.httpStatus}`}
                      {checkResult.contentLengthLabel &&
                        ` · Dimensione: ${checkResult.contentLengthLabel}`}
                    </p>
                    {checkResult.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                        <span>{w}</span>
                      </p>
                    ))}
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
                      {checkResult.antivirusDisclaimer}
                    </p>
                  </div>
                )}
              </form>

              {/* Report Unverified File Form */}
              <form
                onSubmit={handleReportSubmit}
                className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
              >
                <h3 className="text-xl font-bold text-white">
                  Segnala File o Link Non Verificato
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Nome gioco o pacchetto"
                    className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-4 text-sm text-white placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    placeholder="Link o fonte segnalata"
                    className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-4 text-sm text-white placeholder:text-slate-500"
                  />
                </div>
                <select
                  aria-label="Motivo segnalazione"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-4 text-sm text-white"
                >
                  <option value="Link o file APK non verificato / sospetto">
                    Link o file APK non verificato / sospetto
                  </option>
                  <option value="Possibile APK modificato o non autorizzato">
                    Possibile APK modificato o non autorizzato
                  </option>
                  <option value="Collegamento non funzionante o errato">
                    Collegamento non funzionante o errato
                  </option>
                </select>
                <button
                  type="submit"
                  className="min-h-[48px] px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  Invia Segnalazione a GameCheck
                </button>
                {reportFeedback && (
                  <p className="text-xs font-semibold text-emerald-300">
                    {reportFeedback}
                  </p>
                )}

                {reports.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <p className="text-xs font-bold text-slate-400">
                      Segnalazioni recenti ({reports.length})
                    </p>
                    {reports.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl bg-[#141E34] border border-white/10 px-3.5 py-2.5 text-xs flex flex-wrap justify-between gap-2"
                      >
                        <span className="font-semibold text-white">
                          {r.targetTitle} · {r.reason}
                        </span>
                        <span className="text-amber-300 font-bold">
                          {r.status} · {r.createdAt}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* STORE CATALOG VIEW (ALL / ONLINE / OFFLINE / APK / FAVORITES) */
        <div className="space-y-6">
          {/* Search & Store Filters */}
          <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca gioco, genere, sviluppatore o package..."
                  className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 pl-11 pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label="Filtra per genere"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-3.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  {distinctGenres.map((g) => (
                    <option key={g} value={g}>
                      Genere: {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label="Filtra multiplayer"
                  value={multiplayerFilter}
                  onChange={(e) =>
                    setMultiplayerFilter(e.target.value as "all" | "multi" | "solo")
                  }
                  className="w-full min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-3.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Modalità: Tutte</option>
                  <option value="multi">Solo Multiplayer</option>
                  <option value="solo">Giocatore Singolo / Offline</option>
                </select>
              </div>
            </div>

            {activeSubTab === "apk" && (
              <div className="rounded-2xl bg-[#141E34] border border-emerald-500/30 px-4 py-3 flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Politica APK Store Sicuro:</strong> GAMECOACH AI non
                  ospita file APK propri, non avvia installazioni automatiche e non
                  distribuisce giochi piratati o modificati. I download collegano
                  esclusivamente a repository ufficiali autorizzati verificati da
                  GameCheck.
                </p>
              </div>
            )}
          </section>

          {loadingCatalog ? (
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-10 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-400 mx-auto" />
              <p className="text-sm text-slate-300">
                Caricamento giochi verificati di GAMECOACH ARCADE...
              </p>
            </div>
          ) : catalogError ? (
            <div className="rounded-3xl bg-rose-950/40 border border-rose-500/40 p-6 text-sm text-rose-200">
              {catalogError}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 text-center space-y-2">
              <p className="text-lg font-bold text-white">
                Nessun gioco trovato con questi filtri
              </p>
              <p className="text-sm text-slate-400">
                {activeSubTab === "favorites"
                  ? "Aggiungi giochi ai Preferiti toccando l'icona cuore sulle schede dello store."
                  : "Prova a cambiare genere o parola di ricerca."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const isFav = favorites.includes(item.id);
                const myStars = ratings[item.id] || 0;
                const imgSrc = item.imageUrl || getFallbackThumb(item);

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl bg-[#0F172A] border border-white/10 overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="relative h-44 bg-[#080E1C] overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/25" />

                        <button
                          type="button"
                          onClick={() => onToggleFavorite(item.id)}
                          aria-label={
                            isFav ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
                          }
                          className={`absolute top-3 right-3 min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors ${
                            isFav
                              ? "bg-rose-600 text-white"
                              : "bg-black/55 text-slate-200 hover:bg-black/75"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                        </button>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                          <span className="font-semibold text-blue-400">
                            {categoryLabel(item.category)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.genre}</span>
                          {item.multiplayer && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-violet-300 font-semibold">
                                Multiplayer
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-white leading-snug">
                          {item.title}
                        </h2>

                        <p className="text-xs text-slate-400">
                          Sviluppatore: {item.developer}
                          {item.version ? ` · v${item.version}` : ""}
                          {item.sizeLabel ? ` · ${item.sizeLabel}` : ""}
                        </p>

                        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Connectivity & Source Verification Line */}
                        <div className="pt-1 space-y-1 text-xs">
                          <p className="text-slate-300 inline-flex items-center gap-1.5">
                            {item.requiresInternet ? (
                              <>
                                <Wifi className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                Richiede connessione Internet
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                Funziona senza connessione (Offline)
                              </>
                            )}
                          </p>
                          <p className="text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              Fonte verificata: {item.sourceName}
                            </span>
                          </p>
                        </div>

                        {/* Interactive Verified Local Rating */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                aria-label={`Valuta ${star} stelle`}
                                onClick={() => onRateGame(item.id, star)}
                                className="p-0.5 cursor-pointer"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <= myStars
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-600 hover:text-amber-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {myStars > 0
                              ? `Tua valutazione: ${myStars}/5`
                              : "Nessuna valutazione salvata"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2">
                      {item.instantPlayMode === "native" && item.instantPlayId ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPlayingNative({
                              id: item.instantPlayId!,
                              title: item.title,
                            })
                          }
                          className="flex-1 min-h-[46px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                          Gioca Ora
                        </button>
                      ) : item.category === "apk" && !item.apkAvailable ? (
                        <div className="w-full space-y-2">
                          <p className="text-xs font-semibold text-amber-300">
                            Non scaricabile tramite APK:{" "}
                            {item.unavailableReason ||
                              "Nessuna fonte APK ufficiale disponibile."}
                          </p>
                          <button
                            type="button"
                            onClick={() => void handleInspectItem(item)}
                            className="w-full min-h-[44px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                          >
                            Scheda & Store Ufficiale
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleInspectItem(item)}
                          className="flex-1 min-h-[46px] px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {item.category === "apk" ? (
                            <>
                              <Download className="w-4 h-4" />
                              Dettagli & GameCheck
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4" />
                              Apri Scheda Gioco
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Native HTML5 Game Modal */}
      <ArcadeGamePlayerModal
        gameId={playingNative?.id ?? null}
        title={playingNative?.title ?? ""}
        onClose={() => setPlayingNative(null)}
      />

      {/* Game Details + GameCheck Inspection Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-3xl bg-[#0F172A] border border-white/15 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-blue-400">
                  {categoryLabel(selectedItem.category)} · {selectedItem.genre}
                </p>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">
                  {selectedItem.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sviluppatore: {selectedItem.developer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="min-h-[40px] px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
              >
                Chiudi
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">
              {selectedItem.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#141E34] border border-white/10 p-3">
                <p className="text-slate-400 font-semibold">Connessione</p>
                <p className="text-white font-bold mt-0.5">
                  {selectedItem.requiresInternet
                    ? "Richiede Internet"
                    : "Utilizzabile Offline"}
                </p>
              </div>
              <div className="rounded-xl bg-[#141E34] border border-white/10 p-3">
                <p className="text-slate-400 font-semibold">Versione & Peso</p>
                <p className="text-white font-bold mt-0.5 tabular-nums">
                  {selectedItem.version || "Versione web"} ·{" "}
                  {selectedItem.sizeLabel || "Nessun download"}
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-[#141E34] border border-white/10 p-3">
                <p className="text-slate-400 font-semibold">Requisiti & Fonte</p>
                <p className="text-white mt-0.5">{selectedItem.requirements}</p>
                <p className="text-emerald-300 font-semibold mt-1">
                  Fonte: {selectedItem.sourceName}
                  {selectedItem.packageName
                    ? ` · Package: ${selectedItem.packageName}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Live GameCheck Status */}
            <div className="rounded-2xl bg-[#141E34] border border-emerald-500/35 p-4 space-y-2 text-xs">
              <p className="font-bold text-emerald-300 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Verifica Provenienza GameCheck
              </p>
              {apkCheckLoading ? (
                <p className="text-slate-300 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Controllo dominio e stato HTTP ufficiale...
                </p>
              ) : apkCheckResult ? (
                <>
                  <p className="text-white font-semibold">
                    Stato: {apkCheckResult.provenanceStatus} · Dominio:{" "}
                    {apkCheckResult.domain} · HTTPS:{" "}
                    {apkCheckResult.isHttps ? "Sì" : "No"}
                    {apkCheckResult.httpStatus !== null
                      ? ` · HTTP ${apkCheckResult.httpStatus}`
                      : ""}
                  </p>
                  {apkCheckResult.warnings.map((w, idx) => (
                    <p key={idx} className="text-amber-200">
                      {w}
                    </p>
                  ))}
                  <p className="text-[11px] text-slate-400">
                    {apkCheckResult.antivirusDisclaimer}
                  </p>
                </>
              ) : (
                <p className="text-slate-300">
                  Verifica ufficiale eseguita sulla fonte autorizzata indicata.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {selectedItem.category === "apk" ? (
                selectedItem.apkAvailable && selectedItem.apkDownloadUrl ? (
                  <a
                    href={selectedItem.apkDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Scarica APK da Fonte Ufficiale ({selectedItem.sourceDomain})
                  </a>
                ) : (
                  <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3 text-xs text-amber-200 font-semibold">
                    Non scaricabile tramite APK:{" "}
                    {selectedItem.unavailableReason ||
                      "Nessuna fonte APK autorizzata disponibile."}
                  </div>
                )
              ) : null}

              <div className="flex flex-wrap gap-2">
                {selectedItem.officialUrl && (
                  <a
                    href={selectedItem.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[46px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {selectedItem.category === "online"
                      ? "Avvia su Portale Ufficiale"
                      : "Sito / Fonte Ufficiale"}
                  </a>
                )}

                {(selectedItem.playStoreUrl || selectedItem.storePageUrl) && (
                  <a
                    href={selectedItem.playStoreUrl || selectedItem.storePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[46px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Pagina Store / Repository
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
