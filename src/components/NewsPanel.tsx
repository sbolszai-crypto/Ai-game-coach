import React, { useState } from "react";
import { AlertCircle, ExternalLink, Loader2, Newspaper, RefreshCw } from "lucide-react";
import type { CatalogGameItem, GameId } from "../types";
import { GAMES } from "../data/games";
import { GameCatalogModal } from "./GameCatalogModal";

interface NewsPanelProps {
  activeGameId: GameId;
  customGameTitle: string;
}

interface NewsResult {
  available: boolean;
  summary: string;
  sources: Array<{ title: string; url: string }>;
  fetchedAt?: string;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({
  activeGameId,
  customGameTitle,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<GameId>(activeGameId);
  const [customNewsGame, setCustomNewsGame] = useState<string>(customGameTitle);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [news, setNews] = useState<NewsResult | null>(null);

  const chosenName =
    selectedGameId === "altri" && customNewsGame.trim()
      ? customNewsGame.trim()
      : GAMES.find((g) => g.id === selectedGameId)?.name ?? "Fortnite";

  const fetchNews = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName: chosenName }),
      });

      const data = (await res.json()) as NewsResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Servizio Gaming News non disponibile.");
      }

      setNews({
        available: data.available,
        summary: data.summary,
        sources: Array.isArray(data.sources) ? data.sources : [],
        fetchedAt: data.fetchedAt,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Impossibile caricare fonti aggiornate in questo momento."
      );
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-blue-400 text-sm font-bold">
          <Newspaper className="w-5 h-5" />
          Gaming News · Solo Fonti Verificate
        </div>
        <h2 className="text-2xl font-bold text-white">
          Aggiornamenti, Patch ed Eventi per Gioco
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Seleziona un gioco e cerca le novità reali tramite Google Search Grounding.
          Non vengono mai inventate notizie: se non è disponibile una fonte
          aggiornata, l'app lo dichiara chiaramente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <select
            aria-label="Scegli gioco per le notizie"
            value={selectedGameId}
            onChange={(e) => {
              setSelectedGameId(e.target.value as GameId);
              setNews(null);
              setErrorMsg(null);
            }}
            className="flex-1 min-h-[52px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
          >
            {GAMES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id === "altri" && customNewsGame
                  ? customNewsGame
                  : g.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setCatalogOpen(true)}
            className="min-h-[52px] px-4 rounded-2xl bg-[#141E34] border border-white/15 hover:border-blue-400 text-xs sm:text-sm font-bold text-blue-300 cursor-pointer shrink-0"
          >
            5.500+ Giochi
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void fetchNews()}
            className="min-h-[52px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ricerca fonti reali...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Carica Notizie per {chosenName}
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-2xl bg-rose-950/50 border border-rose-500/40 p-5 flex items-start gap-3 text-rose-200 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {news && (
        <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-bold text-blue-400">
              {news.available
                ? `Fonti verificate trovate per ${chosenName}`
                : `Nessuna fonte aggiornata disponibile per ${chosenName}`}
            </span>
            {news.fetchedAt && <span className="tabular-nums">{news.fetchedAt}</span>}
          </div>

          <div className="text-base text-slate-100 leading-relaxed whitespace-pre-line">
            {news.summary}
          </div>

          {news.sources.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <p className="text-xs font-bold text-slate-400">
                Collegamenti agli articoli originali
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {news.sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#141E34] border border-white/10 hover:border-blue-400 text-sm font-semibold text-blue-300 flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="truncate">{src.title}</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GameCatalogModal
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        title="Scegli un gioco per le Gaming News (5.500+ titoli)"
        onSelectCatalogGame={(item: CatalogGameItem) => {
          setSelectedGameId("altri");
          setCustomNewsGame(item.name);
          setNews(null);
          setErrorMsg(null);
        }}
      />
    </div>
  );
};
