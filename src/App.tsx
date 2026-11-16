import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_DAILY_GOALS,
  GAMES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_PROFILE,
  INITIAL_PROGRESS,
  INITIAL_TOURNAMENTS,
  INITIAL_WORKOUTS,
  getDisplayGameName,
} from "./data/games";
import type {
  AccessibilitySettings,
  AppPersistedState,
  ArcadeReportItem,
  CatalogGameItem,
  ChatMessage,
  CoachPersonality,
  CommunityPost,
  CommunityReport,
  CommunityTournamentPost,
  DailyGoal,
  GameId,
  GamerProfile,
  GamingTeam,
  LfgListing,
  MatchLogEntry,
  MediaAnalysisRecord,
  NavTab,
  PersonalTournamentRecord,
  PlayerLevel,
  PlayerProgress,
  ScheduledWorkout,
  TournamentEntry,
  Workout,
} from "./types";
import { storageRepository } from "./services/storage";
import { TopBar } from "./components/TopBar";
import { HomeView } from "./components/HomeView";
import { CoachView, type CoachSubMode } from "./components/CoachView";
import { WorkoutsView } from "./components/WorkoutsView";
import { ArcadeView } from "./components/ArcadeView";
import { TournamentsView } from "./components/TournamentsView";
import { CommunityView } from "./components/CommunityView";
import { StatsView } from "./components/StatsView";
import { ProfileView } from "./components/ProfileView";
import { TrophiesView } from "./components/TrophiesView";
import { WorkoutRunnerModal } from "./components/WorkoutRunnerModal";
import { GameCatalogModal } from "./components/GameCatalogModal";

function createInitialMessages(gameName: string): ChatMessage[] {
  return [
    {
      id: "welcome-coach",
      role: "coach",
      text: `Ciao! Sono Coach Marco. Siamo pronti ad allenarci su ${gameName}. Raccontami cosa vuoi migliorare oggi, racconta la tua ultima partita oppure carica una clip nel Replay Lab.`,
      timestamp: new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      gameId: "fortnite",
    },
  ];
}

export default function App() {
  const saved = useMemo(() => storageRepository.load(), []);

  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [coachInitialMode, setCoachInitialMode] = useState<CoachSubMode>("free");

  const [profile, setProfile] = useState<GamerProfile>({
    ...INITIAL_PROFILE,
    ...(saved?.profile ?? {}),
  });
  const [activeGameId, setActiveGameId] = useState<GameId>(
    saved?.activeGameId ?? "fortnite"
  );
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(
    saved?.dailyGoals ?? DEFAULT_DAILY_GOALS
  );
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>(
    saved?.customWorkouts ?? []
  );
  const [progress, setProgress] = useState<PlayerProgress>({
    ...INITIAL_PROGRESS,
    ...(saved?.progress ?? {}),
  });
  const [messages, setMessages] = useState<ChatMessage[]>(
    saved?.messages && saved.messages.length > 0
      ? saved.messages
      : createInitialMessages(
          getDisplayGameName(
            saved?.activeGameId ?? "fortnite",
            saved?.profile?.customGameTitle
          )
        )
  );
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const base =
      saved?.communityPosts && saved.communityPosts.length > 0
        ? saved.communityPosts
        : INITIAL_COMMUNITY_POSTS;
    return base.filter(
      (p) => !p.isDemoStarter && p.authorNickname !== "CoachMarco_Ufficiale"
    );
  });
  const [blockedUsers, setBlockedUsers] = useState<string[]>(
    saved?.blockedUsers ?? []
  );
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(
    saved?.communityReports ?? []
  );
  const [followedTopics, setFollowedTopics] = useState<string[]>(
    saved?.followedTopics ?? []
  );
  const [followedTournamentIds, setFollowedTournamentIds] = useState<string[]>(
    saved?.followedTournamentIds ?? []
  );
  const [lfgListings, setLfgListings] = useState<LfgListing[]>(
    saved?.lfgListings ?? []
  );
  const [communityTournaments, setCommunityTournaments] = useState<
    CommunityTournamentPost[]
  >(saved?.communityTournaments ?? []);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>(
    saved?.purchasedItemIds ?? []
  );
  const [tournaments, setTournaments] = useState<TournamentEntry[]>(
    saved?.tournaments && saved.tournaments.length > 0
      ? saved.tournaments
      : INITIAL_TOURNAMENTS
  );
  const [personalTournaments, setPersonalTournaments] = useState<
    PersonalTournamentRecord[]
  >(saved?.personalTournaments ?? []);
  const [team, setTeam] = useState<GamingTeam | null>(saved?.team ?? null);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<
    ScheduledWorkout[]
  >(saved?.scheduledWorkouts ?? []);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    ...DEFAULT_ACCESSIBILITY,
    ...(saved?.accessibility ?? {}),
  });
  const [arcadeFavorites, setArcadeFavorites] = useState<string[]>(
    saved?.arcadeFavorites ?? []
  );
  const [arcadeRatings, setArcadeRatings] = useState<Record<string, number>>(
    saved?.arcadeRatings ?? {}
  );
  const [arcadeReports, setArcadeReports] = useState<ArcadeReportItem[]>(
    saved?.arcadeReports ?? []
  );

  const [runningWorkout, setRunningWorkout] = useState<Workout | null>(null);
  const [runningProgramMeta, setRunningProgramMeta] = useState<
    { kind: "7d" | "30d"; day: number } | undefined
  >(undefined);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const activeGame = useMemo(
    () => GAMES.find((g) => g.id === activeGameId) ?? GAMES[0],
    [activeGameId]
  );

  const displayGameName = useMemo(
    () => getDisplayGameName(activeGameId, profile.customGameTitle),
    [activeGameId, profile.customGameTitle]
  );

  const allWorkouts = useMemo(
    () => [...customWorkouts, ...INITIAL_WORKOUTS],
    [customWorkouts]
  );

  const warmupWorkout = useMemo(() => {
    return (
      allWorkouts.find((w) => w.gameId === activeGameId && w.isWarmup) ??
      INITIAL_WORKOUTS[0]
    );
  }, [allWorkouts, activeGameId]);

  const dailyWorkout = useMemo(() => {
    return (
      allWorkouts.find((w) => w.gameId === activeGameId && w.isDaily) ??
      allWorkouts.find((w) => w.gameId === activeGameId) ??
      INITIAL_WORKOUTS[1]
    );
  }, [allWorkouts, activeGameId]);

  // Apply Accessibility settings to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = accessibility.textSize;
    root.dataset.bigButtons = String(accessibility.bigButtons);
    root.dataset.highContrast = String(accessibility.highContrast);
    root.dataset.colorMode = accessibility.colorMode;
    root.dataset.reduceMotion = String(accessibility.reduceMotion);
  }, [accessibility]);

  // Persist complete app state via StorageRepository
  useEffect(() => {
    const payload: AppPersistedState = {
      profile,
      activeGameId,
      dailyGoals,
      customWorkouts,
      progress,
      messages: messages.slice(-30),
      communityPosts: communityPosts.slice(0, 40),
      blockedUsers,
      communityReports: communityReports.slice(0, 40),
      followedTopics,
      followedCreators: [],
      followedTournamentIds,
      lfgListings: lfgListings.slice(0, 30),
      communityTournaments: communityTournaments.slice(0, 20),
      purchasedItemIds,
      tournaments,
      personalTournaments,
      team,
      scheduledWorkouts,
      accessibility,
      arcadeFavorites,
      arcadeRatings,
      arcadeReports: arcadeReports.slice(0, 30),
    };
    storageRepository.save(payload);
  }, [
    profile,
    activeGameId,
    dailyGoals,
    customWorkouts,
    progress,
    messages,
    communityPosts,
    blockedUsers,
    communityReports,
    followedTopics,
    followedTournamentIds,
    lfgListings,
    communityTournaments,
    purchasedItemIds,
    tournaments,
    personalTournaments,
    team,
    scheduledWorkouts,
    accessibility,
    arcadeFavorites,
    arcadeRatings,
    arcadeReports,
  ]);

  const awardXp = (deltaXp: number) => {
    setProgress((p) => ({
      ...p,
      xp: Math.max(0, p.xp + deltaXp),
      spendableXp: Math.max(0, p.spendableXp + deltaXp),
    }));
  };

  const markGoalTypeCompleted = (type: DailyGoal["type"]) => {
    setDailyGoals((prev) => {
      const target = prev.find((g) => g.type === type && !g.completed);
      if (!target) return prev;
      awardXp(target.xpReward);
      return prev.map((g) =>
        g.id === target.id ? { ...g, completed: true } : g
      );
    });
  };

  const handleSelectGame = (gameId: GameId) => {
    setActiveGameId(gameId);
    const chosen = GAMES.find((g) => g.id === gameId);
    if (chosen) {
      const label = getDisplayGameName(gameId, profile.customGameTitle);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.gameId === gameId) return prev;
        return [
          ...prev,
          {
            id: `switch-${Date.now()}`,
            role: "coach",
            text: `Perfetto, passiamo a ${label}! Consiglio veloce: ${chosen.shortTip} Dimmi cosa vuoi migliorare oggi.`,
            timestamp: new Date().toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            gameId,
          },
        ];
      });
    }
  };

  const handleSelectCatalogGame = (item: CatalogGameItem) => {
    const matched = GAMES.find(
      (g) => g.id !== "altri" && g.name.toLowerCase() === item.name.toLowerCase()
    );
    if (matched) {
      handleSelectGame(matched.id);
      return;
    }
    setProfile((prev) => ({
      ...prev,
      customGameTitle: item.name,
      favoriteGameId: "altri",
    }));
    setActiveGameId("altri");
    setMessages((prev) => [
      ...prev,
      {
        id: `catalog-${Date.now()}`,
        role: "coach",
        text: `Ottima scelta: ${item.name} (${item.genre})! Ho adattato il coaching e gli allenamenti a questo gioco. Cosa vuoi migliorare per prima cosa?`,
        timestamp: new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        gameId: "altri",
      },
    ]);
  };

  const handleChangeLevel = (level: PlayerLevel) => {
    setProfile((prev) => ({ ...prev, level }));
  };

  const handleChangePersonality = (coachPersonality: CoachPersonality) => {
    setProfile((prev) => ({ ...prev, coachPersonality }));
  };

  const handleToggleGoal = (goalId: string) => {
    setDailyGoals((prev) => {
      const target = prev.find((g) => g.id === goalId);
      if (!target) return prev;
      const nextCompleted = !target.completed;
      awardXp(nextCompleted ? target.xpReward : -target.xpReward);
      return prev.map((g) =>
        g.id === goalId ? { ...g, completed: nextCompleted } : g
      );
    });
  };

  const handleAddMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    if (msg.role === "user") {
      setProgress((p) => ({
        ...p,
        coachMessagesCount: p.coachMessagesCount + 1,
      }));
      markGoalTypeCompleted("coach");
    }
  };

  const handleDetectWeakness = (weakness: string) => {
    const clean = weakness.trim();
    if (!clean) return;
    setProfile((prev) => {
      if (prev.weaknesses.some((w) => w.toLowerCase() === clean.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        weaknesses: [clean, ...prev.weaknesses].slice(0, 8),
      };
    });
  };

  const handleSaveMediaAnalysis = (record: MediaAnalysisRecord) => {
    setProgress((p) => ({
      ...p,
      mediaAnalysesCount: p.mediaAnalysesCount + 1,
      mediaAnalyses: [record, ...p.mediaAnalyses].slice(0, 15),
    }));
  };

  const handleStartWorkout = (
    workout: Workout,
    programMeta?: { kind: "7d" | "30d"; day: number }
  ) => {
    setRunningProgramMeta(programMeta);
    setRunningWorkout(workout);
  };

  const handleAddCustomWorkout = (workout: Workout) => {
    setCustomWorkouts((prev) => [workout, ...prev]);
    handleStartWorkout(workout);
  };

  const handleCompleteWorkout = (workout: Workout) => {
    const today = new Date().toISOString().slice(0, 10);
    setProgress((p) => {
      const prevSkill = p.skills[workout.skillCategory] ?? 0;
      const nextSkill = Math.min(100, prevSkill + 8);
      const isNewDay = p.lastActiveDate !== today;
      const nextActiveDates = p.activeDates.includes(today)
        ? p.activeDates
        : [...p.activeDates, today];

      const next7d =
        runningProgramMeta?.kind === "7d" &&
        !p.completedProgram7Days.includes(runningProgramMeta.day)
          ? [...p.completedProgram7Days, runningProgramMeta.day]
          : p.completedProgram7Days;

      const next30d =
        runningProgramMeta?.kind === "30d" &&
        !p.completedProgram30Days.includes(runningProgramMeta.day)
          ? [...p.completedProgram30Days, runningProgramMeta.day]
          : p.completedProgram30Days;

      return {
        ...p,
        xp: p.xp + workout.xpReward,
        spendableXp: p.spendableXp + workout.xpReward,
        streakDays: isNewDay ? p.streakDays + 1 : p.streakDays,
        lastActiveDate: today,
        activeDates: nextActiveDates,
        totalMinutes: p.totalMinutes + workout.durationMinutes,
        completedWorkoutsCount: p.completedWorkoutsCount + 1,
        skills: {
          ...p.skills,
          [workout.skillCategory]: nextSkill,
        },
        gameMinutes: {
          ...p.gameMinutes,
          [workout.gameId]:
            (p.gameMinutes[workout.gameId] ?? 0) + workout.durationMinutes,
        },
        completedProgram7Days: next7d,
        completedProgram30Days: next30d,
        recentSessions: [
          {
            id: `session-${Date.now()}`,
            workoutTitle: workout.title,
            gameId: workout.gameId,
            durationMinutes: workout.durationMinutes,
            xpEarned: workout.xpReward,
            skillCategory: workout.skillCategory,
            dateISO: today,
            completedAt: new Date().toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...p.recentSessions,
        ].slice(0, 30),
      };
    });

    if (workout.isWarmup) {
      markGoalTypeCompleted("warmup");
    } else {
      markGoalTypeCompleted("workout");
    }
    setRunningProgramMeta(undefined);
  };

  // Match Diary
  const handleAddMatchLog = (
    entry: Omit<MatchLogEntry, "id" | "dateISO" | "createdAtLabel">
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    const created: MatchLogEntry = {
      ...entry,
      id: `match-${Date.now()}`,
      dateISO: today,
      createdAtLabel: new Date().toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setProgress((p) => ({
      ...p,
      activeDates: p.activeDates.includes(today)
        ? p.activeDates
        : [...p.activeDates, today],
      matchDiary: [created, ...p.matchDiary].slice(0, 40),
    }));
    markGoalTypeCompleted("match");
  };

  const handleAnalyzeMatchWithCoach = (match: MatchLogEntry) => {
    const label = getDisplayGameName(match.gameId, match.customGameTitle);
    const coachPromptMsg: ChatMessage = {
      id: `match-coach-${Date.now()}`,
      role: "coach",
      text: `Ho letto la tua partita di ${label} (${match.outcome}, ${match.durationMinutes} min). Hai fatto bene: "${match.highlight}". Errore indicato: "${match.mistake}". Raccontami in che momento della partita è successo così ti preparo un esercizio mirato.`,
      timestamp: new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      gameId: match.gameId,
    };
    setActiveGameId(match.gameId);
    setMessages((prev) => [...prev, coachPromptMsg]);
    setCoachInitialMode("postmatch");
    setActiveTab("coach");
  };

  // Gamer Calendar
  const handleAddSchedule = (
    item: Omit<ScheduledWorkout, "id" | "completed">
  ) => {
    setScheduledWorkouts((prev) => [
      { ...item, id: `sched-${Date.now()}`, completed: false },
      ...prev,
    ]);
  };

  const handleToggleSchedule = (id: string) => {
    setScheduledWorkouts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduledWorkouts((prev) => prev.filter((s) => s.id !== id));
  };

  // Community Handlers
  const handlePublishPost = (post: CommunityPost) => {
    setCommunityPosts((prev) => [post, ...prev]);
  };

  const handleToggleLike = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likes: Math.max(0, p.likes + (p.likedByMe ? -1 : 1)),
            }
          : p
      )
    );
  };

  const handleAddComment = (
    postId: string,
    commentText: string,
    moderationMethod: string
  ) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `cmt-${Date.now()}`,
                  authorNickname: profile.nickname,
                  authorAvatarId: profile.avatarId,
                  text: commentText,
                  createdAt: "Adesso",
                  moderationMethod,
                },
              ],
            }
          : p
      )
    );
  };

  const handleReportPost = (post: CommunityPost, reason: string) => {
    setCommunityReports((prev) => [
      {
        id: `rep-${Date.now()}`,
        postId: post.id,
        postTitle: post.title,
        authorNickname: post.authorNickname,
        reason,
        reportedAt: new Date().toLocaleString("it-IT"),
        status: "In revisione",
      },
      ...prev,
    ]);
    setCommunityPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  const handleResolveReport = (
    reportId: string,
    decision: "Rimosso" | "Approvato"
  ) => {
    setCommunityReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: decision } : r))
    );
  };

  const handleBlockUser = (nickname: string) => {
    setBlockedUsers((prev) =>
      prev.includes(nickname) ? prev : [...prev, nickname]
    );
  };

  const handleUnblockUser = (nickname: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u !== nickname));
  };

  const handleToggleFollowTopic = (topic: string) => {
    setFollowedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleToggleArcadeFavorite = (gameId: string) => {
    setArcadeFavorites((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleRateArcadeGame = (gameId: string, stars: number) => {
    setArcadeRatings((prev) => ({
      ...prev,
      [gameId]: Math.max(1, Math.min(5, stars)),
    }));
  };

  const handleSubmitArcadeReport = (
    rep: Omit<ArcadeReportItem, "id" | "createdAt" | "status">
  ) => {
    setArcadeReports((prev) => [
      {
        ...rep,
        id: `arc-rep-${Date.now()}`,
        createdAt: new Date().toLocaleString("it-IT"),
        status: "Segnalato per revisione",
      },
      ...prev,
    ]);
  };

  const handlePublishLfg = (listing: LfgListing) => {
    setLfgListings((prev) => [listing, ...prev]);
  };

  const handlePublishCommunityTournament = (t: CommunityTournamentPost) => {
    setCommunityTournaments((prev) => [t, ...prev]);
  };

  const handleJoinCommunityTournament = (
    id: string,
    participantName: string
  ) => {
    setCommunityTournaments((prev) =>
      prev.map((ct) =>
        ct.id === id && !ct.participants.includes(participantName)
          ? { ...ct, participants: [...ct.participants, participantName] }
          : ct
      )
    );
  };

  const handleRecordCommunityTournamentResult = (
    id: string,
    participant: string,
    score: number,
    note: string
  ) => {
    setCommunityTournaments((prev) =>
      prev.map((ct) =>
        ct.id === id
          ? {
              ...ct,
              results: [
                ...ct.results.filter((r) => r.participant !== participant),
                { participant, score, note },
              ].sort((a, b) => b.score - a.score),
            }
          : ct
      )
    );
  };

  const handleAddCommunityTournamentUpdate = (
    id: string,
    updateText: string
  ) => {
    setCommunityTournaments((prev) =>
      prev.map((ct) =>
        ct.id === id ? { ...ct, updates: [updateText, ...ct.updates] } : ct
      )
    );
  };

  const handleToggleFollowTournament = (id: string) => {
    setFollowedTournamentIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Tournaments & Challenges Handlers
  const handleToggleJoinChallenge = (id: string) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, joined: !t.joined } : t))
    );
  };

  const handleRecordChallengeResult = (id: string, points: number) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const firstScore = t.recordedScore === null;
        if (firstScore) {
          awardXp(t.prizeXp);
        }
        return {
          ...t,
          recordedScore: (t.recordedScore ?? 0) + points,
          recordedMatches: t.recordedMatches + 1,
        };
      })
    );
  };

  const handleSavePersonalTournament = (record: PersonalTournamentRecord) => {
    setPersonalTournaments((prev) => [record, ...prev]);
  };

  const handleUpdatePersonalTournament = (
    id: string,
    patch: Partial<PersonalTournamentRecord>
  ) => {
    setPersonalTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const handleDeletePersonalTournament = (id: string) => {
    setPersonalTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  // Shop Handler (only spends real earned spendableXp)
  const handleBuyShopItem = (itemId: string, costXp: number) => {
    if (purchasedItemIds.includes(itemId) || progress.spendableXp < costXp) {
      return;
    }
    setProgress((p) => ({
      ...p,
      spendableXp: Math.max(0, p.spendableXp - costXp),
    }));
    setPurchasedItemIds((prev) => [...prev, itemId]);
  };

  // Profile, Export & Wipe
  const handleExportData = () => {
    const data: AppPersistedState = {
      profile,
      activeGameId,
      dailyGoals,
      customWorkouts,
      progress,
      messages,
      communityPosts,
      blockedUsers,
      communityReports,
      followedTopics,
      followedCreators: [],
      followedTournamentIds,
      lfgListings,
      communityTournaments,
      purchasedItemIds,
      tournaments,
      personalTournaments,
      team,
      scheduledWorkouts,
      accessibility,
      arcadeFavorites,
      arcadeRatings,
      arcadeReports,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gamecoach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWipeAllData = () => {
    storageRepository.clear();
    setProfile(INITIAL_PROFILE);
    setActiveGameId("fortnite");
    setDailyGoals(DEFAULT_DAILY_GOALS);
    setCustomWorkouts([]);
    setProgress(INITIAL_PROGRESS);
    setMessages(createInitialMessages("Fortnite"));
    setCommunityPosts(INITIAL_COMMUNITY_POSTS);
    setBlockedUsers([]);
    setCommunityReports([]);
    setFollowedTopics([]);
    setFollowedTournamentIds([]);
    setLfgListings([]);
    setCommunityTournaments([]);
    setPurchasedItemIds([]);
    setTournaments(INITIAL_TOURNAMENTS);
    setPersonalTournaments([]);
    setTeam(null);
    setScheduledWorkouts([]);
    setAccessibility(DEFAULT_ACCESSIBILITY);
    setArcadeFavorites([]);
    setArcadeRatings({});
    setArcadeReports([]);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeGameName={displayGameName}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-12">
        {activeTab === "home" && (
          <HomeView
            profile={profile}
            activeGame={activeGame}
            displayGameName={displayGameName}
            onChangeLevel={handleChangeLevel}
            onSelectGame={handleSelectGame}
            onUpdateCustomGameTitle={(title) =>
              setProfile((prev) => ({ ...prev, customGameTitle: title }))
            }
            dailyGoals={dailyGoals}
            onToggleGoal={handleToggleGoal}
            warmupWorkout={warmupWorkout}
            dailyWorkout={dailyWorkout}
            onStartWorkout={(w) => handleStartWorkout(w)}
            onNavigate={setActiveTab}
            onOpenCoachMedia={() => {
              setCoachInitialMode("media");
              setActiveTab("coach");
            }}
            onOpenCatalog={() => setCatalogOpen(true)}
            progress={progress}
          />
        )}

        {activeTab === "coach" && (
          <CoachView
            profile={profile}
            activeGame={activeGame}
            displayGameName={displayGameName}
            progress={progress}
            messages={messages}
            initialMode={coachInitialMode}
            onModeConsumed={() => setCoachInitialMode("free")}
            onChangePersonality={handleChangePersonality}
            onAddMessage={handleAddMessage}
            onDetectWeakness={handleDetectWeakness}
            onStartAssignedWorkout={(w) => handleStartWorkout(w)}
            onSaveMediaAnalysis={handleSaveMediaAnalysis}
          />
        )}

        {activeTab === "workouts" && (
          <WorkoutsView
            activeGame={activeGame}
            displayGameName={displayGameName}
            customGameTitle={profile.customGameTitle}
            playerLevel={profile.level}
            workouts={allWorkouts}
            progress={progress}
            dailyGoals={dailyGoals}
            scheduledWorkouts={scheduledWorkouts}
            onAddCustomWorkout={handleAddCustomWorkout}
            onStartWorkout={handleStartWorkout}
            onAddSchedule={handleAddSchedule}
            onToggleSchedule={handleToggleSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {activeTab === "arcade" && (
          <ArcadeView
            favorites={arcadeFavorites}
            ratings={arcadeRatings}
            reports={arcadeReports}
            onToggleFavorite={handleToggleArcadeFavorite}
            onRateGame={handleRateArcadeGame}
            onSubmitReport={handleSubmitArcadeReport}
          />
        )}

        {activeTab === "tournaments" && (
          <TournamentsView
            profile={profile}
            activeGameId={activeGameId}
            customGameTitle={profile.customGameTitle}
            communityChallenges={tournaments}
            personalTournaments={personalTournaments}
            onToggleJoinChallenge={handleToggleJoinChallenge}
            onRecordChallengeResult={handleRecordChallengeResult}
            onSavePersonalTournament={handleSavePersonalTournament}
            onUpdatePersonalTournament={handleUpdatePersonalTournament}
            onDeletePersonalTournament={handleDeletePersonalTournament}
          />
        )}

        {activeTab === "community" && (
          <CommunityView
            profile={profile}
            progress={progress}
            activeGameId={activeGameId}
            posts={communityPosts}
            blockedUsers={blockedUsers}
            reports={communityReports}
            followedTopics={followedTopics}
            followedTournamentIds={followedTournamentIds}
            lfgListings={lfgListings}
            communityTournaments={communityTournaments}
            team={team}
            onPublishPost={handlePublishPost}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onReportPost={handleReportPost}
            onResolveReport={handleResolveReport}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onToggleFollowTopic={handleToggleFollowTopic}
            onPublishLfg={handlePublishLfg}
            onPublishCommunityTournament={handlePublishCommunityTournament}
            onJoinCommunityTournament={handleJoinCommunityTournament}
            onRecordCommunityTournamentResult={handleRecordCommunityTournamentResult}
            onAddCommunityTournamentUpdate={handleAddCommunityTournamentUpdate}
            onToggleFollowTournament={handleToggleFollowTournament}
            onCreateTeam={setTeam}
            onUpdateTeam={setTeam}
            onLeaveTeam={() => setTeam(null)}
            onStartTeamWorkout={(w) => handleStartWorkout(w)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "stats" && (
          <StatsView
            profile={profile}
            progress={progress}
            dailyGoals={dailyGoals}
            activeGameId={activeGameId}
            teamActive={Boolean(team)}
            onAddMatchLog={handleAddMatchLog}
            onAnalyzeMatchWithCoach={handleAnalyzeMatchWithCoach}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            profile={profile}
            progress={progress}
            purchasedItemIds={purchasedItemIds}
            accessibility={accessibility}
            onUpdateProfile={(patch) =>
              setProfile((prev) => ({ ...prev, ...patch }))
            }
            onUpdateAccessibility={(patch) =>
              setAccessibility((prev) => ({ ...prev, ...patch }))
            }
            onAddPersonalGoal={(text) =>
              setProfile((prev) => ({
                ...prev,
                personalGoals: [
                  ...prev.personalGoals,
                  { id: `pg-${Date.now()}`, text, done: false },
                ],
              }))
            }
            onTogglePersonalGoal={(id) =>
              setProfile((prev) => ({
                ...prev,
                personalGoals: prev.personalGoals.map((g) =>
                  g.id === id ? { ...g, done: !g.done } : g
                ),
              }))
            }
            onDeletePersonalGoal={(id) =>
              setProfile((prev) => ({
                ...prev,
                personalGoals: prev.personalGoals.filter((g) => g.id !== id),
              }))
            }
            onRemoveWeakness={(w) =>
              setProfile((prev) => ({
                ...prev,
                weaknesses: prev.weaknesses.filter((item) => item !== w),
              }))
            }
            onExportData={handleExportData}
            onWipeAllData={handleWipeAllData}
            onOpenCatalog={() => setCatalogOpen(true)}
          />
        )}

        {activeTab === "trophies" && (
          <TrophiesView
            progress={progress}
            dailyGoals={dailyGoals}
            purchasedItemIds={purchasedItemIds}
            team={team}
            onBuyShopItem={handleBuyShopItem}
          />
        )}
      </main>

      {runningWorkout && (
        <WorkoutRunnerModal
          workout={runningWorkout}
          gameName={getDisplayGameName(
            runningWorkout.gameId,
            profile.customGameTitle
          )}
          onClose={() => {
            setRunningWorkout(null);
            setRunningProgramMeta(undefined);
          }}
          onComplete={handleCompleteWorkout}
        />
      )}

      <GameCatalogModal
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onSelectCatalogGame={handleSelectCatalogGame}
      />
    </div>
  );
}
