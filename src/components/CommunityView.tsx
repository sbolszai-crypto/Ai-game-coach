import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Ban,
  Bell,
  CheckCircle2,
  Compass,
  Flag,
  Heart,
  Loader2,
  MessageCircle,
  Newspaper,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import type {
  CommunityCategory,
  CommunityPost,
  CommunityReport,
  CommunityTournamentPost,
  GameId,
  GamerProfile,
  GamingTeam,
  LfgListing,
  NavTab,
  PlayerLevel,
  PlayerProgress,
  Workout,
} from "../types";
import {
  GAMES,
  SHOP_ITEMS,
  TROPHIES,
  getDisplayGameName,
  getRankTitle,
} from "../data/games";
import { GameEmblem, GamerAvatarBadge } from "./GameEmblem";
import { TeamsPanel } from "./TeamsPanel";
import { NewsPanel } from "./NewsPanel";

interface CommunityViewProps {
  profile: GamerProfile;
  progress: PlayerProgress;
  activeGameId: GameId;
  posts: CommunityPost[];
  blockedUsers: string[];
  reports: CommunityReport[];
  followedTopics: string[];
  followedTournamentIds: string[];
  lfgListings: LfgListing[];
  communityTournaments: CommunityTournamentPost[];
  team: GamingTeam | null;
  onPublishPost: (post: CommunityPost) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (
    postId: string,
    commentText: string,
    moderationMethod: string
  ) => void;
  onReportPost: (post: CommunityPost, reason: string) => void;
  onResolveReport: (reportId: string, decision: "Rimosso" | "Approvato") => void;
  onBlockUser: (nickname: string) => void;
  onUnblockUser: (nickname: string) => void;
  onToggleFollowTopic: (topic: string) => void;
  onPublishLfg: (listing: LfgListing) => void;
  onPublishCommunityTournament: (t: CommunityTournamentPost) => void;
  onJoinCommunityTournament: (id: string, participantName: string) => void;
  onRecordCommunityTournamentResult: (
    id: string,
    participant: string,
    score: number,
    note: string
  ) => void;
  onAddCommunityTournamentUpdate: (id: string, updateText: string) => void;
  onToggleFollowTournament: (id: string) => void;
  onCreateTeam: (team: GamingTeam) => void;
  onUpdateTeam: (team: GamingTeam) => void;
  onLeaveTeam: () => void;
  onStartTeamWorkout: (workout: Workout) => void;
  onNavigate: (tab: NavTab) => void;
}

type CommunitySubTab =
  | "feed"
  | "gamers"
  | "teams"
  | "ctournaments"
  | "news"
  | "moderation";

const CATEGORIES: CommunityCategory[] = [
  "STRATEGIE",
  "EPIC FAILS",
  "CLIP EPICHE",
  "VITTORIE",
  "CONSIGLI GAMING",
];

const REPORT_REASONS = [
  "Contenuto sessualmente esplicito o NSFW",
  "Insulti, bullismo o minacce",
  "Spam o link sospetti",
  "Dati personali o violazione sicurezza minori",
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  profile,
  progress,
  activeGameId,
  posts,
  blockedUsers,
  reports,
  followedTopics,
  followedTournamentIds,
  lfgListings,
  communityTournaments,
  team,
  onPublishPost,
  onToggleLike,
  onAddComment,
  onReportPost,
  onResolveReport,
  onBlockUser,
  onUnblockUser,
  onToggleFollowTopic,
  onPublishLfg,
  onPublishCommunityTournament,
  onJoinCommunityTournament,
  onRecordCommunityTournamentResult,
  onAddCommunityTournamentUpdate,
  onToggleFollowTournament,
  onCreateTeam,
  onUpdateTeam,
  onLeaveTeam,
  onStartTeamWorkout,
  onNavigate,
}) => {
  const [subTab, setSubTab] = useState<CommunitySubTab>("feed");
  const [moderationOnline, setModerationOnline] = useState<boolean | null>(null);

  // Feed filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategory | "ALL">("ALL");
  const [gameFilter, setGameFilter] = useState<GameId | "ALL">("ALL");
  const [onlyFollowed, setOnlyFollowed] = useState(false);

  // Post Composer
  const [showComposer, setShowComposer] = useState(false);
  const [newCategory, setNewCategory] = useState<CommunityCategory>("STRATEGIE");
  const [newGameId, setNewGameId] = useState<GameId>(activeGameId);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const [isModeratingPost, setIsModeratingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);

  // Comments
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [moderatingCommentId, setModeratingCommentId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<Record<string, string>>({});

  // Report Modal
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);

  // LFG (Cerca Compagni) state
  const [lfgGameId, setLfgGameId] = useState<GameId>(activeGameId);
  const [lfgMode, setLfgMode] = useState("Duo / Squadra");
  const [lfgRole, setLfgRole] = useState("Giocatore collaborativo");
  const [lfgNote, setLfgNote] = useState("");
  const [lfgLoading, setLfgLoading] = useState(false);
  const [lfgError, setLfgError] = useState<string | null>(null);

  // Community Tournaments composer state
  const [ctTitle, setCtTitle] = useState("");
  const [ctGameId, setCtGameId] = useState<GameId>(activeGameId);
  const [ctMode, setCtMode] = useState<CommunityTournamentPost["mode"]>("Squadra");
  const [ctLevel, setCtLevel] = useState<PlayerLevel>(profile.level);
  const [ctPlatform, setCtPlatform] = useState("Cross-Platform");
  const [ctDate, setCtDate] = useState("");
  const [ctRules, setCtRules] = useState("");
  const [ctPrize, setCtPrize] = useState("Trofeo Virtuale + Onore Arena");
  const [ctLoading, setCtLoading] = useState(false);
  const [ctError, setCtError] = useState<string | null>(null);
  const [ctScoreInputs, setCtScoreInputs] = useState<Record<string, string>>({});
  const [ctUpdateInputs, setCtUpdateInputs] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((r) => r.json())
      .then((d: { ok?: boolean; aiConfigured?: boolean }) => {
        if (active) setModerationOnline(Boolean(d.ok && d.aiConfigured));
      })
      .catch(() => {
        if (active) setModerationOnline(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const displayGameName = getDisplayGameName(activeGameId, profile.customGameTitle);
  const myUnlockedTrophiesCount = TROPHIES.filter(
    (t) => t.check(progress, 0).unlocked
  ).length;
  const equippedFrame = SHOP_ITEMS.find((i) => i.id === profile.equippedFrameId);
  const equippedBg = SHOP_ITEMS.find((i) => i.id === profile.equippedBgId);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const removedIds = new Set(
      reports.filter((r) => r.status === "Rimosso").map((r) => r.postId)
    );

    return posts.filter((p) => {
      if (blockedUsers.includes(p.authorNickname)) return false;
      if (removedIds.has(p.id)) return false;
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
      if (gameFilter !== "ALL" && p.gameId !== gameFilter) return false;
      if (
        onlyFollowed &&
        !followedTopics.includes(p.category) &&
        !followedTopics.includes(p.gameId)
      ) {
        return false;
      }
      if (q) {
        const gName = getDisplayGameName(p.gameId, p.customGameTitle).toLowerCase();
        const hay = `${p.title} ${p.body} ${p.category} ${gName} ${p.authorNickname}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    posts,
    blockedUsers,
    reports,
    categoryFilter,
    gameFilter,
    onlyFollowed,
    followedTopics,
    searchQuery,
  ]);

  const moderateContent = async (
    title: string,
    body: string,
    mediaB64 = "",
    mime = ""
  ): Promise<{ ok: boolean; method: string; reason?: string }> => {
    if (moderationOnline === false) {
      return {
        ok: false,
        method: "",
        reason:
          "Sistema di moderazione AI non attivo: per la sicurezza di tutti non è possibile pubblicare contenuti senza verifica automatica.",
      };
    }

    const res = await fetch("/api/community/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        mediaBase64: mediaB64,
        mimeType: mime,
      }),
    });

    const data = (await res.json()) as {
      approved?: boolean;
      reason?: string;
      method?: string;
    };

    if (!res.ok || !data.approved) {
      return {
        ok: false,
        method: data.method || "",
        reason:
          data.reason ||
          "Contenuto bloccato dai controlli di sicurezza prima della pubblicazione.",
      };
    }
    return {
      ok: true,
      method: data.method || "Moderazione AI Gemini + Filtri Sicurezza",
    };
  };

  const handleSelectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPostError(null);
    if (!file) return;

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!allowed.includes(file.type)) {
      setPostError(
        "Formato non consentito. Carica solo PNG, JPG, WEBP o brevi clip MP4/WEBM."
      );
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setPostError("File troppo grande (max 15 MB) per la moderazione automatica.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaFile(file);
      setMediaDataUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isModeratingPost) return;

    setPostError(null);
    setPostSuccess(null);

    if (!newTitle.trim() || !newBody.trim()) {
      setPostError("Inserisci sia un titolo che una descrizione prima di pubblicare.");
      return;
    }

    setIsModeratingPost(true);
    try {
      const mediaBase64 = mediaDataUrl
        ? mediaDataUrl.slice(mediaDataUrl.indexOf(",") + 1)
        : "";
      const mod = await moderateContent(
        newTitle.trim(),
        newBody.trim(),
        mediaBase64,
        mediaFile?.type || ""
      );

      if (!mod.ok) {
        throw new Error(mod.reason);
      }

      const created: CommunityPost = {
        id: `post-${Date.now()}`,
        authorNickname: profile.nickname,
        authorAvatarId: profile.avatarId,
        gameId: newGameId,
        customGameTitle:
          newGameId === "altri" ? profile.customGameTitle : undefined,
        category: newCategory,
        title: newTitle.trim(),
        body: newBody.trim(),
        mediaDataUrl: mediaDataUrl || undefined,
        mediaType: mediaFile
          ? mediaFile.type.startsWith("video/")
            ? "video"
            : "image"
          : undefined,
        likes: 0,
        likedByMe: false,
        comments: [],
        createdAt: "Adesso",
        moderationMethod: mod.method,
      };

      onPublishPost(created);
      setNewTitle("");
      setNewBody("");
      setMediaFile(null);
      setMediaDataUrl(null);
      setShowComposer(false);
      setPostSuccess("Contenuto verificato dai controlli di sicurezza e pubblicato!");
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : "Impossibile verificare il post in questo momento."
      );
    } finally {
      setIsModeratingPost(false);
    }
  };

  const handleSubmitComment = async (postId: string) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text || moderatingCommentId) return;

    setModeratingCommentId(postId);
    setCommentError((prev) => ({ ...prev, [postId]: "" }));

    try {
      const mod = await moderateContent("Commento community", text);
      if (!mod.ok) {
        throw new Error(mod.reason);
      }
      onAddComment(postId, text, mod.method);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      setCommentError((prev) => ({
        ...prev,
        [postId]:
          err instanceof Error
            ? err.message
            : "Errore di verifica del commento.",
      }));
    } finally {
      setModeratingCommentId(null);
    }
  };

  const handlePublishLfgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lfgLoading || !lfgNote.trim()) return;
    setLfgLoading(true);
    setLfgError(null);

    try {
      const mod = await moderateContent(
        `Cerco compagni ${lfgMode} - ${lfgRole}`,
        lfgNote.trim()
      );
      if (!mod.ok) throw new Error(mod.reason);

      onPublishLfg({
        id: `lfg-${Date.now()}`,
        authorNickname: profile.nickname,
        authorAvatarId: profile.avatarId,
        authorLevel: profile.level,
        gameId: lfgGameId,
        customGameTitle: lfgGameId === "altri" ? profile.customGameTitle : undefined,
        roleWanted: lfgRole.trim() || "Compagno",
        mode: lfgMode,
        note: lfgNote.trim(),
        createdAt: "Adesso",
        moderationMethod: mod.method,
      });
      setLfgNote("");
    } catch (err) {
      setLfgError(
        err instanceof Error ? err.message : "Annuncio bloccato dalla moderazione."
      );
    } finally {
      setLfgLoading(false);
    }
  };

  const handlePublishCtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ctLoading) return;
    setCtError(null);

    if (!ctTitle.trim() || !ctDate.trim() || !ctRules.trim()) {
      setCtError("Compila titolo, data/ora e regole del torneo prima di pubblicare.");
      return;
    }

    setCtLoading(true);
    try {
      const mod = await moderateContent(
        ctTitle.trim(),
        `${ctRules.trim()} | Premio: ${ctPrize.trim()} | Data: ${ctDate.trim()}`
      );
      if (!mod.ok) throw new Error(mod.reason);

      onPublishCommunityTournament({
        id: `ct-${Date.now()}`,
        organizerNickname: profile.nickname,
        organizerAvatarId: profile.avatarId,
        title: ctTitle.trim(),
        gameId: ctGameId,
        customGameTitle: ctGameId === "altri" ? profile.customGameTitle : undefined,
        mode: ctMode,
        level: ctLevel,
        platform: ctPlatform,
        dateLabel: ctDate.trim(),
        rules: ctRules.trim(),
        prizeLabel: ctPrize.trim() || "Premio virtuale community",
        participants: [team ? `${profile.nickname} (${team.name})` : profile.nickname],
        results: [],
        updates: ["Torneo pubblicato e verificato."],
        createdAt: "Adesso",
        moderationMethod: mod.method,
      });
      setCtTitle("");
      setCtDate("");
      setCtRules("");
    } catch (err) {
      setCtError(
        err instanceof Error ? err.message : "Torneo non approvato dalla moderazione."
      );
    } finally {
      setCtLoading(false);
    }
  };

  const pendingReportsCount = reports.filter((r) => r.status === "In revisione").length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-400">
            Social Network Gaming · 100% Gratuito & Sicuro per Minori
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
            GAMECOACH Community
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
            Profili gamer, clip, strategie, squadre, compagni di gioco, tornei della
            community e notizie ufficiali.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubTab("feed");
            setShowComposer((v) => !v);
          }}
          className="min-h-[50px] px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base cursor-pointer shrink-0 transition-all"
        >
          {showComposer ? "Chiudi Nuovo Post" : "+ Pubblica Post / Clip"}
        </button>
      </div>

      {/* Sub-navigation Social */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 rounded-2xl bg-[#0F172A] border border-white/10 p-2">
        <button
          type="button"
          onClick={() => setSubTab("feed")}
          className={`min-h-[46px] px-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-colors ${
            subTab === "feed"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          Post & Clip
        </button>

        <button
          type="button"
          onClick={() => setSubTab("gamers")}
          className={`min-h-[46px] px-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "gamers"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          Profili Gamer
        </button>

        <button
          type="button"
          onClick={() => setSubTab("teams")}
          className={`min-h-[46px] px-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "teams"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Squadre & Amici
        </button>

        <button
          type="button"
          onClick={() => setSubTab("ctournaments")}
          className={`min-h-[46px] px-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "ctournaments"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          Tornei Social
        </button>

        <button
          type="button"
          onClick={() => setSubTab("news")}
          className={`min-h-[46px] px-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "news"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Newspaper className="w-4 h-4 shrink-0" />
          Gaming News
        </button>

        <button
          type="button"
          onClick={() => setSubTab("moderation")}
          className={`min-h-[46px] px-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === "moderation"
              ? "bg-rose-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Sicurezza ({pendingReportsCount + blockedUsers.length})
        </button>
      </div>

      {/* Banner Moderazione & Sicurezza */}
      <section
        className={`rounded-2xl bg-[#0F172A] border p-4 sm:p-5 flex items-start gap-3.5 ${
          moderationOnline === false
            ? "border-rose-500/50"
            : "border-emerald-500/30"
        }`}
      >
        <ShieldCheck
          className={`w-6 h-6 shrink-0 mt-0.5 ${
            moderationOnline === false ? "text-rose-400" : "text-emerald-400"
          }`}
        />
        <div className="text-xs sm:text-sm text-slate-300 space-y-1">
          <p className="font-bold text-white">
            {moderationOnline === false
              ? "Moderazione AI non attiva: pubblicazione nuovi contenuti bloccata"
              : "Protezione NSFW, Anti-Bullismo e Sicurezza Minorenni attiva"}
          </p>
          <p>
            Ogni post, commento, annuncio compagni e torneo viene controllato prima
            della pubblicazione contro nudità, violenza, insulti, spam e dati
            personali. Nessuna chat privata con sconosciuti, nessuna posizione reale,
            solo nickname.
          </p>
        </div>
      </section>

      {postSuccess && (
        <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 px-5 py-3.5 flex items-center gap-3 text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{postSuccess}</span>
        </div>
      )}

      {/* TAB 1: POST & CLIP */}
      {subTab === "feed" && (
        <>
          {showComposer && (
            <form
              onSubmit={handleCreatePost}
              className="rounded-3xl bg-[#0F172A] border border-blue-500/40 p-6 sm:p-7 space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Condividi nella Community
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Pubblichi come <strong className="text-white">{profile.nickname}</strong> ·
                  Non inserire numeri di telefono, indirizzi o link esterni.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="post-cat" className="text-sm font-semibold text-slate-300 block">
                    Categoria
                  </label>
                  <select
                    id="post-cat"
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as CommunityCategory)
                    }
                    className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="post-game" className="text-sm font-semibold text-slate-300 block">
                    Gioco
                  </label>
                  <select
                    id="post-game"
                    value={newGameId}
                    onChange={(e) => setNewGameId(e.target.value as GameId)}
                    className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white focus:outline-none focus:border-blue-500"
                  >
                    {GAMES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="post-title" className="text-sm font-semibold text-slate-300 block">
                  Titolo
                </label>
                <input
                  id="post-title"
                  type="text"
                  maxLength={90}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Vittoria in rimonta con strategia di squadra"
                  className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="post-body" className="text-sm font-semibold text-slate-300 block">
                  Descrizione
                </label>
                <textarea
                  id="post-body"
                  rows={3}
                  maxLength={600}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Racconta la clip, la strategia o l'epic fail..."
                  className="w-full rounded-2xl bg-[#141E34] border border-white/15 p-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                  onChange={handleSelectMedia}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[50px] px-5 rounded-2xl bg-[#141E34] border border-white/15 hover:border-blue-400 text-sm font-semibold text-slate-200 inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  {mediaFile
                    ? `Allegato: ${mediaFile.name}`
                    : "Allega Screenshot o Clip Video (max 15 MB)"}
                </button>
              </div>

              {postError && (
                <div
                  role="alert"
                  className="rounded-2xl bg-rose-950/60 border border-rose-500/40 px-4 py-3 flex items-start gap-3 text-rose-200 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                  <span>{postError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isModeratingPost || moderationOnline === false}
                className="w-full min-h-[54px] rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
              >
                {isModeratingPost ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Controllo sicurezza NSFW & Privacy in corso...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Verifica e Pubblica
                  </>
                )}
              </button>
            </form>
          )}

          {/* Search & Filters */}
          <section className="rounded-3xl bg-[#0F172A] border border-white/10 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per argomento, gioco o strategia..."
                  className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 pl-12 pr-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                aria-label="Filtra per gioco"
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value as GameId | "ALL")}
                className="min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tutti i giochi</option>
                {GAMES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setOnlyFollowed((v) => !v)}
                className={`min-h-[50px] px-4 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  onlyFollowed
                    ? "bg-violet-600 text-white"
                    : "bg-[#141E34] border border-white/15 text-slate-300"
                }`}
              >
                <Bell className="w-4 h-4" />
                Seguiti ({followedTopics.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("ALL")}
                className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  categoryFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-[#141E34] text-slate-300 hover:text-white"
                }`}
              >
                TUTTE
              </button>
              {CATEGORIES.map((cat) => {
                const active = categoryFilter === cat;
                const followed = followedTopics.includes(cat);
                return (
                  <div key={cat} className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-[#141E34] text-slate-300 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                    <button
                      type="button"
                      title={followed ? `Smetti di seguire ${cat}` : `Segui ${cat}`}
                      onClick={() => onToggleFollowTopic(cat)}
                      className={`min-h-[42px] min-w-[36px] rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                        followed
                          ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                          : "bg-[#141E34] text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Feed Posts */}
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 text-center space-y-2">
              <p className="text-lg font-semibold text-white">
                Nessun post trovato con questi filtri
              </p>
              <p className="text-sm text-slate-400">
                Modifica la ricerca o pubblica il primo post verificato della community!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post) => {
                const gameLabel = getDisplayGameName(
                  post.gameId,
                  post.customGameTitle
                );

                return (
                  <article
                    key={post.id}
                    className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <GamerAvatarBadge
                          avatarId={post.authorAvatarId}
                          sizeClass="h-11 w-11"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white">
                              {post.authorNickname}
                            </span>
                            <span className="text-xs text-slate-400">
                              · {post.createdAt}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-blue-400">
                            {post.category} · {gameLabel} · {post.moderationMethod}
                          </p>
                        </div>
                      </div>

                      {post.authorNickname !== profile.nickname && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReportingPost(post)}
                            className="min-h-[42px] px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Segnala
                          </button>
                          <button
                            type="button"
                            onClick={() => onBlockUser(post.authorNickname)}
                            className="min-h-[42px] px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Blocca
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GameEmblem
                          gameId={post.gameId}
                          className="w-5 h-5 text-violet-300 shrink-0"
                        />
                        <h2 className="text-xl font-bold text-white">
                          {post.title}
                        </h2>
                      </div>
                      <p className="text-base text-slate-200 leading-relaxed whitespace-pre-line">
                        {post.body}
                      </p>
                    </div>

                    {post.mediaDataUrl && (
                      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        {post.mediaType === "video" ? (
                          <video
                            src={post.mediaDataUrl}
                            controls
                            className="w-full max-h-80 object-contain"
                          />
                        ) : (
                          <img
                            src={post.mediaDataUrl}
                            alt={post.title}
                            className="w-full max-h-80 object-contain"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => onToggleLike(post.id)}
                        className={`min-h-[44px] px-4 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                          post.likedByMe
                            ? "bg-violet-600 text-white"
                            : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.likedByMe ? "fill-white" : ""}`}
                        />
                        <span className="tabular-nums">{post.likes}</span> Mi piace
                      </button>

                      <span className="text-sm text-slate-400 inline-flex items-center gap-1.5 tabular-nums">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments.length} commenti
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {post.comments
                        .filter((c) => !blockedUsers.includes(c.authorNickname))
                        .map((c) => (
                          <div
                            key={c.id}
                            className="rounded-2xl bg-[#141E34] border border-white/5 px-4 py-3 text-sm space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-bold text-slate-200">
                                {c.authorNickname}
                              </span>
                              <span>{c.createdAt}</span>
                            </div>
                            <p className="text-slate-200">{c.text}</p>
                          </div>
                        ))}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Scrivi un commento costruttivo..."
                          className="flex-1 min-h-[48px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          disabled={
                            moderatingCommentId === post.id ||
                            moderationOnline === false ||
                            !(commentInputs[post.id] || "").trim()
                          }
                          onClick={() => void handleSubmitComment(post.id)}
                          className="min-h-[48px] px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
                        >
                          {moderatingCommentId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Commenta
                        </button>
                      </div>

                      {commentError[post.id] && (
                        <p className="text-xs text-rose-400">
                          {commentError[post.id]}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: IL TUO PROFILO GAMER SOCIAL */}
      {subTab === "gamers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section
            className={`lg:col-span-6 rounded-3xl border border-blue-500/40 p-6 sm:p-7 space-y-5 ${
              equippedBg?.previewClass || "bg-[#0F172A]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl ${equippedFrame?.previewClass || ""}`}>
                <GamerAvatarBadge avatarId={profile.avatarId} sizeClass="h-16 w-16" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400">Il tuo Profilo Gamer</p>
                <h2 className="text-2xl font-bold text-white">{profile.nickname}</h2>
                <p className="text-xs text-slate-300">
                  {getRankTitle(progress.xp)} · {profile.level} ·{" "}
                  {getDisplayGameName(profile.favoriteGameId, profile.customGameTitle)}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">
              {profile.bio || "Nessuna bio impostata ancora."}
            </p>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-2xl bg-[#141E34] border border-white/10 p-3">
                <p className="font-mono text-lg font-extrabold text-white tabular-nums">
                  {progress.xp}
                </p>
                <p className="text-[11px] text-slate-400">XP Reali</p>
              </div>
              <div className="rounded-2xl bg-[#141E34] border border-white/10 p-3">
                <p className="font-mono text-lg font-extrabold text-violet-300 tabular-nums">
                  {myUnlockedTrophiesCount}
                </p>
                <p className="text-[11px] text-slate-400">Trofei</p>
              </div>
              <div className="rounded-2xl bg-[#141E34] border border-white/10 p-3">
                <p className="font-mono text-lg font-extrabold text-emerald-400 tabular-nums">
                  {progress.matchDiary.filter((m) => m.outcome === "Vittoria").length}
                </p>
                <p className="text-[11px] text-slate-400">Vittorie</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("profile")}
              className="w-full min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm cursor-pointer"
            >
              Personalizza Profilo, Bio e Avatar
            </button>
          </section>

          <section className="lg:col-span-6 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Argomenti & Categorie Seguite
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Scegli quali categorie seguire nel feed di GAMECOACH Community.
                Nessun creator finto o profilo esterno è mostrato in questa sezione.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const followed = followedTopics.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onToggleFollowTopic(cat)}
                    className={`min-h-[48px] px-4 rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                      followed
                        ? "bg-violet-600 text-white"
                        : "bg-[#141E34] border border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{cat}</span>
                    <Bell className="w-4 h-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: SQUADRE & CERCA COMPAGNI (AMICI) */}
      {subTab === "teams" && (
        <div className="space-y-8">
          <TeamsPanel
            nickname={profile.nickname}
            activeGameId={activeGameId}
            displayGameName={displayGameName}
            playerLevel={profile.level}
            team={team}
            onCreateTeam={onCreateTeam}
            onUpdateTeam={onUpdateTeam}
            onLeaveTeam={onLeaveTeam}
            onStartTeamWorkout={onStartTeamWorkout}
          />

          {/* Bacheca Sicura Cerca Compagni (LFT) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handlePublishLfgSubmit}
              className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">
                Cerca Compagni di Gioco
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Usa solo il tuo nickname e descrivi ruolo/orari. Non inserire chat
                esterne, numeri di telefono o nomi reali.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <select
                  aria-label="Gioco compagni"
                  value={lfgGameId}
                  onChange={(e) => setLfgGameId(e.target.value as GameId)}
                  className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
                >
                  {GAMES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={lfgMode}
                  onChange={(e) => setLfgMode(e.target.value)}
                  placeholder="Modalità (es. Duo)"
                  className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
                />
              </div>

              <input
                type="text"
                value={lfgRole}
                onChange={(e) => setLfgRole(e.target.value)}
                placeholder="Ruolo o obiettivo (es. Supporto / Allenamento)"
                className="w-full min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3.5 text-sm text-white"
              />

              <textarea
                rows={2}
                maxLength={220}
                value={lfgNote}
                onChange={(e) => setLfgNote(e.target.value)}
                placeholder="Es. Cerco compagni tranquilli per allenarci alle 18:00..."
                className="w-full rounded-xl bg-[#141E34] border border-white/15 p-3 text-sm text-white"
              />

              {lfgError && (
                <p className="text-xs text-rose-400 font-semibold">{lfgError}</p>
              )}

              <button
                type="submit"
                disabled={lfgLoading || moderationOnline === false || !lfgNote.trim()}
                className="w-full min-h-[50px] rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm cursor-pointer"
              >
                {lfgLoading ? "Verifica sicurezza..." : "Pubblica Annuncio Compagni"}
              </button>
            </form>

            <div className="lg:col-span-7 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">
                Bacheca Compagni Verificati ({lfgListings.length})
              </h3>
              {lfgListings.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nessun annuncio pubblicato finora. Scrivi qui a fianco per trovare
                  compagni di allenamento o di torneo.
                </p>
              ) : (
                <div className="space-y-3">
                  {lfgListings
                    .filter((l) => !blockedUsers.includes(l.authorNickname))
                    .map((l) => (
                      <div
                        key={l.id}
                        className="rounded-2xl bg-[#141E34] border border-white/10 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-blue-400">
                            {l.authorNickname} · {l.authorLevel} ·{" "}
                            {getDisplayGameName(l.gameId, l.customGameTitle)}
                          </span>
                          <span className="text-slate-400">
                            {l.mode} · {l.createdAt}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-violet-300">
                          Ruolo: {l.roleWanted}
                        </p>
                        <p className="text-sm text-slate-200">{l.note}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: COMMUNITY TORNEI */}
      {subTab === "ctournaments" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#0F172A] border border-blue-500/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Tornei Organizzati dalla Community
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Pubblica tornei verificati, cerca partecipanti, iscrivi la tua squadra
                e segui gli aggiornamenti. Cerchi eventi ufficiali esterni?
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("tournaments")}
              className="min-h-[48px] px-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Apri Tournament Finder
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Pubblica Torneo Community */}
            <form
              onSubmit={handlePublishCtSubmit}
              className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
            >
              <h3 className="text-xl font-bold text-white">
                Pubblica Torneo Community
              </h3>
              <input
                type="text"
                maxLength={70}
                value={ctTitle}
                onChange={(e) => setCtTitle(e.target.value)}
                placeholder="Nome torneo (es. Coppa Amichevole 3v3)"
                className="w-full min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3.5 text-sm text-white"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  aria-label="Gioco torneo community"
                  value={ctGameId}
                  onChange={(e) => setCtGameId(e.target.value as GameId)}
                  className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
                >
                  {GAMES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Modalità torneo community"
                  value={ctMode}
                  onChange={(e) =>
                    setCtMode(e.target.value as CommunityTournamentPost["mode"])
                  }
                  className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
                >
                  {(["Solo", "Duo", "Trio", "Squadra"] as const).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  aria-label="Livello torneo community"
                  value={ctLevel}
                  onChange={(e) => setCtLevel(e.target.value as PlayerLevel)}
                  className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
                >
                  {(["Principiante", "Intermedio", "Avanzato"] as const).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ctPlatform}
                  onChange={(e) => setCtPlatform(e.target.value)}
                  placeholder="Piattaforma"
                  className="min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-sm text-white"
                />
              </div>
              <input
                type="text"
                value={ctDate}
                onChange={(e) => setCtDate(e.target.value)}
                placeholder="Data e orario (es. Sabato 17:00)"
                className="w-full min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3.5 text-sm text-white"
              />
              <input
                type="text"
                value={ctPrize}
                onChange={(e) => setCtPrize(e.target.value)}
                placeholder="Premio virtuale / badge"
                className="w-full min-h-[48px] rounded-xl bg-[#141E34] border border-white/15 px-3.5 text-sm text-white"
              />
              <textarea
                rows={2}
                maxLength={280}
                value={ctRules}
                onChange={(e) => setCtRules(e.target.value)}
                placeholder="Regole chiare e requisiti (100% gratuito, adatto ai minori)..."
                className="w-full rounded-xl bg-[#141E34] border border-white/15 p-3 text-sm text-white"
              />

              {ctError && (
                <p className="text-xs text-rose-400 font-semibold">{ctError}</p>
              )}

              <button
                type="submit"
                disabled={ctLoading || moderationOnline === false}
                className="w-full min-h-[50px] rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm cursor-pointer"
              >
                {ctLoading ? "Moderazione in corso..." : "Verifica e Pubblica Torneo"}
              </button>
            </form>

            {/* Lista Tornei Community */}
            <div className="lg:col-span-7 space-y-4">
              {communityTournaments.length === 0 ? (
                <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 text-center space-y-2">
                  <Swords className="w-8 h-8 text-blue-400 mx-auto" />
                  <p className="text-lg font-semibold text-white">
                    Nessun torneo community pubblicato ancora
                  </p>
                  <p className="text-sm text-slate-400">
                    Organizza il primo torneo gratuito della community qui a fianco:
                    nessun torneo finto viene generato in automatico.
                  </p>
                </div>
              ) : (
                communityTournaments.map((ct) => {
                  const isJoined = ct.participants.some((p) =>
                    p.startsWith(profile.nickname)
                  );
                  const isFollowed = followedTournamentIds.includes(ct.id);
                  return (
                    <article
                      key={ct.id}
                      className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-blue-400">
                            {getDisplayGameName(ct.gameId, ct.customGameTitle)} ·{" "}
                            {ct.mode} · {ct.level} · {ct.platform}
                          </p>
                          <h3 className="text-xl font-bold text-white mt-0.5">
                            {ct.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Organizzato da {ct.organizerNickname} · {ct.dateLabel}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleFollowTournament(ct.id)}
                          className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                            isFollowed
                              ? "bg-violet-600 text-white"
                              : "bg-white/10 text-slate-200"
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          {isFollowed ? "Seguito" : "Segui aggiornamenti"}
                        </button>
                      </div>

                      <p className="text-sm text-slate-200">{ct.rules}</p>
                      <p className="text-xs font-bold text-emerald-400">
                        Premio: {ct.prizeLabel}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {!isJoined && (
                          <button
                            type="button"
                            onClick={() =>
                              onJoinCommunityTournament(
                                ct.id,
                                team
                                  ? `${profile.nickname} (${team.name})`
                                  : profile.nickname
                              )
                            }
                            className="min-h-[44px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                          >
                            {team
                              ? `Partecipa con Squadra (${team.name})`
                              : "Partecipa al Torneo"}
                          </button>
                        )}
                      </div>

                      <div className="rounded-2xl bg-[#141E34] border border-white/10 p-3.5 text-xs space-y-1.5">
                        <p className="font-bold text-slate-300">
                          Partecipanti reali ({ct.participants.length}):{" "}
                          <span className="font-normal text-white">
                            {ct.participants.join(", ")}
                          </span>
                        </p>
                        {ct.results.length > 0 && (
                          <div className="pt-1 space-y-1">
                            <p className="font-bold text-emerald-300">
                              Classifica Reale:
                            </p>
                            {ct.results.map((r, i) => (
                              <p key={i} className="text-slate-200 tabular-nums">
                                {i + 1}. {r.participant} — {r.score} pt ({r.note})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {isJoined && (
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="number"
                            min={0}
                            value={ctScoreInputs[ct.id] || ""}
                            onChange={(e) =>
                              setCtScoreInputs((prev) => ({
                                ...prev,
                                [ct.id]: e.target.value,
                              }))
                            }
                            placeholder="Tuo punteggio"
                            className="w-32 min-h-[42px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-xs text-white tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const pts = Number(ctScoreInputs[ct.id]);
                              if (!Number.isFinite(pts) || pts < 0) return;
                              onRecordCommunityTournamentResult(
                                ct.id,
                                profile.nickname,
                                pts,
                                "Registrato"
                              );
                              setCtScoreInputs((prev) => ({ ...prev, [ct.id]: "" }));
                            }}
                            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Registra Punteggio
                          </button>
                        </div>
                      )}

                      {ct.organizerNickname === profile.nickname && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ctUpdateInputs[ct.id] || ""}
                            onChange={(e) =>
                              setCtUpdateInputs((prev) => ({
                                ...prev,
                                [ct.id]: e.target.value,
                              }))
                            }
                            placeholder="Pubblica aggiornamento torneo..."
                            className="flex-1 min-h-[42px] rounded-xl bg-[#141E34] border border-white/15 px-3 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const txt = (ctUpdateInputs[ct.id] || "").trim();
                              if (!txt) return;
                              onAddCommunityTournamentUpdate(ct.id, txt);
                              setCtUpdateInputs((prev) => ({ ...prev, [ct.id]: "" }));
                            }}
                            className="min-h-[42px] px-3 rounded-xl bg-violet-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Aggiorna
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GAMING NEWS */}
      {subTab === "news" && (
        <NewsPanel
          activeGameId={activeGameId}
          customGameTitle={profile.customGameTitle}
        />
      )}

      {/* TAB 6: MODERAZIONE & UTENTI BLOCCATI */}
      {subTab === "moderation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-7 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Contenuti segnalati per revisione
            </h2>
            {reports.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nessuna segnalazione inviata finora. Puoi segnalare qualsiasi post
                usando il pulsante Segnala.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="rounded-2xl bg-[#141E34] border border-white/10 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap justify-between gap-2 text-xs">
                      <span className="font-bold text-amber-300">
                        Stato: {rep.status} · {rep.reason}
                      </span>
                      <span className="text-slate-400">{rep.reportedAt}</span>
                    </div>
                    <p className="text-sm text-white font-semibold">
                      Post: “{rep.postTitle}” di {rep.authorNickname}
                    </p>
                    {rep.status === "In revisione" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onResolveReport(rep.id, "Rimosso")}
                          className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Rimuovi dal feed
                        </button>
                        <button
                          type="button"
                          onClick={() => onResolveReport(rep.id, "Approvato")}
                          className="min-h-[44px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                        >
                          Ripristina post
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-5 rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Utenti bloccati</h2>
            {blockedUsers.length === 0 ? (
              <p className="text-sm text-slate-400">
                Non hai bloccato nessun utente.
              </p>
            ) : (
              <div className="space-y-2.5">
                {blockedUsers.map((nick) => (
                  <div
                    key={nick}
                    className="rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold text-white">{nick}</span>
                    <button
                      type="button"
                      onClick={() => onUnblockUser(nick)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      Sblocca
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modale Segnalazione */}
      {reportingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#0F172A] border border-white/15 p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Segnala contenuto</h3>
            <p className="text-sm text-slate-300">
              Seleziona il motivo della segnalazione per “{reportingPost.title}”.
              Il post verrà nascosto e inviato alla revisione.
            </p>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    onReportPost(reportingPost, reason);
                    setReportingPost(null);
                  }}
                  className="w-full min-h-[48px] px-4 rounded-2xl bg-[#141E34] hover:bg-amber-600/25 border border-white/10 text-left text-sm font-semibold text-white cursor-pointer transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setReportingPost(null)}
              className="w-full min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-bold text-slate-200 cursor-pointer"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
