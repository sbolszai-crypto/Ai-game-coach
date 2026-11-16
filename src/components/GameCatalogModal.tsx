import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import type { CatalogGameItem } from "../types";

interface GameCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCatalogGame: (game: CatalogGameItem) => void;
  title?: string;
}

interface CatalogResponse {
  totalCatalogCount: number;
  filteredCount: number;
  page: number;
  totalPages: number;
  genres: string[];
  games: CatalogGameItem[];
}

export const GameCatalogModal: React.FC<GameCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectCatalogGame,
  title = "Esplora Catalogo Completo (5.500+ Giochi)",
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genre, setGenre] = useState("Tutti");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CatalogResponse>({
    totalCatalogCount: 0,
    filteredCount: 0,
    page: 1,
    totalPages: 1,
    genres: [],
    games: [],
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 180);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);

    const params = new URLSearchParams({
      q: debouncedQuery,
      genre,
      page: String(page),
      limit: "24",
    });

    fetch(`/api/games?${params.toString()}`)
      .then((r) => r.json())
      .then((res: CatalogResponse) => {
        if (active) setData(res);
      })
      .catch(() => {
        // Keep safe empty fallback
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, debouncedQuery, genre, page]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="w-full max-w-4xl rounded-t-3xl sm:rounded-3xl bg-[#0F172A] border border-white/15 p-5 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold text-blue-400 tabular-nums">
              {data.totalCatalogCount > 0
                ? `${data.totalCatalogCount.toLocaleString("it-IT")} giochi reali disponibili`
                : "Caricamento catalogo..."}
            </p>
            <h2
              id="catalog-modal-title"
              className="mt-0.5 text-xl sm:text-2xl font-extrabold text-white"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi catalogo giochi"
            className="min-h-[46px] min-w-[46px] rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Genre Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca tra 5.500+ giochi per nome o studio (es. Valorant, Elden Ring, Apex...)"
              className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["Tutti", ...data.genres].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGenre(g);
                  setPage(1);
                }}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  genre === g
                    ? "bg-blue-600 text-white"
                    : "bg-[#141E34] border border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-3 text-slate-300">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span>Ricerca nel catalogo...</span>
            </div>
          ) : data.games.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-base font-bold text-white">
                Nessun gioco trovato per “{debouncedQuery}”
              </p>
              <p className="text-xs sm:text-sm text-slate-400">
                Prova con un altro nome oppure inserisci manualmente il titolo in Home.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {data.games.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    onSelectCatalogGame(game);
                    onClose();
                  }}
                  className="min-h-[76px] p-3.5 rounded-2xl bg-[#141E34] hover:bg-blue-600/20 border border-white/10 hover:border-blue-400 text-left flex items-start gap-3 cursor-pointer transition-colors"
                >
                  <Gamepad2 className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {game.name}
                    </p>
                    <p className="text-xs text-blue-400 mt-0.5 truncate">
                      {game.genre}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {game.developer}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-slate-300">
          <span className="tabular-nums">
            {data.filteredCount.toLocaleString("it-IT")} risultati · Pagina{" "}
            {data.page} di {data.totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="min-h-[42px] px-3.5 rounded-xl bg-[#141E34] border border-white/15 disabled:opacity-40 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Prec
            </button>
            <button
              type="button"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              className="min-h-[42px] px-3.5 rounded-xl bg-[#141E34] border border-white/15 disabled:opacity-40 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              Succ
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
