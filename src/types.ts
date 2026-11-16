export type GameId =
  | "fortnite"
  | "cod"
  | "brawlstars"
  | "freefire"
  | "minecraft"
  | "roblox"
  | "rocketleague"
  | "eafc"
  | "pubgmobile"
  | "altri";

export type PlayerLevel = "Principiante" | "Intermedio" | "Avanzato";

export type MissionTier = "Facile" | "Media" | "Difficile";

export type SkillKey =
  | "mira"
  | "riflessi"
  | "movimento"
  | "costruzione"
  | "strategia"
  | "precisione"
  | "tattica"
  | "decisioni";

export type NavTab =
  | "home"
  | "coach"
  | "workouts"
  | "arcade"
  | "tournaments"
  | "community"
  | "stats"
  | "profile"
  | "trophies";

export type CommunityCategory =
  | "STRATEGIE"
  | "EPIC FAILS"
  | "CLIP EPICHE"
  | "VITTORIE"
  | "CONSIGLI GAMING";

export interface CommunityComment {
  id: string;
  authorNickname: string;
  authorAvatarId: AvatarId;
  text: string;
  createdAt: string;
  moderationMethod: string;
}

export interface CommunityReport {
  id: string;
  postId: string;
  postTitle: string;
  authorNickname: string;
  reason: string;
  reportedAt: string;
  status: "In revisione" | "Rimosso" | "Approvato";
}

export interface CommunityPost {
  id: string;
  authorNickname: string;
  authorAvatarId: AvatarId;
  gameId: GameId;
  customGameTitle?: string;
  category: CommunityCategory;
  title: string;
  body: string;
  mediaDataUrl?: string;
  mediaType?: "image" | "video";
  likes: number;
  likedByMe: boolean;
  comments: CommunityComment[];
  createdAt: string;
  moderationMethod: string;
  isDemoStarter?: boolean;
}

export type AvatarId =
  | "visor"
  | "cyber"
  | "tactical"
  | "striker"
  | "builder"
  | "champion";

export interface WorkoutStep {
  id: string;
  title: string;
  instruction: string;
  seconds: number;
}

export interface Workout {
  id: string;
  gameId: GameId;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: PlayerLevel;
  missionTier: MissionTier;
  xpReward: number;
  skillCategory: SkillKey;
  isWarmup?: boolean;
  isDaily?: boolean;
  isCustom?: boolean;
  steps: WorkoutStep[];
}

export interface GameInfo {
  id: GameId;
  name: string;
  genre: string;
  shortTip: string;
  description: string;
  keySkills: SkillKey[];
  starterQuestions: string[];
}

export interface CatalogGameItem {
  id: string;
  name: string;
  genre: string;
  developer: string;
}

export interface DailyGoal {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  completed: boolean;
  type: "workout" | "coach" | "warmup" | "match";
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  xpReward: number;
  metric: "workouts" | "matches" | "coach" | "minutes";
}

export interface ChatMessage {
  id: string;
  role: "user" | "coach";
  text: string;
  timestamp: string;
  gameId: GameId;
  assignedWorkout?: Workout;
}

export interface MediaAnalysisRecord {
  id: string;
  fileName: string;
  mediaType: "image" | "video";
  gameId: GameId;
  note: string;
  analysis: string;
  errors?: string[];
  keyMoments?: string[];
  improvements?: string[];
  detectedWeakness?: string;
  recommendedSkill: SkillKey;
  suggestedWorkout?: Workout;
  createdAt: string;
}

export interface MatchLogEntry {
  id: string;
  gameId: GameId;
  customGameTitle?: string;
  outcome: "Vittoria" | "Sconfitta" | "Pareggio";
  durationMinutes: number;
  highlight: string;
  mistake: string;
  dateISO: string;
  createdAtLabel: string;
}

export interface CompletedSession {
  id: string;
  workoutTitle: string;
  gameId: GameId;
  durationMinutes: number;
  xpEarned: number;
  skillCategory: SkillKey;
  dateISO: string;
  completedAt: string;
}

export interface ProgramDayItem {
  day: number;
  title: string;
  focusSkill: SkillKey;
  instruction: string;
  durationMinutes: number;
  xpReward: number;
}

export interface PersonalGoal {
  id: string;
  text: string;
  done: boolean;
}

export type CoachPersonality =
  | "motivatore"
  | "stratega"
  | "severo"
  | "amichevole";

export type ShopRarity = "Comune" | "Raro" | "Epico" | "Leggendario";
export type ShopCategory = "avatar" | "cornice" | "sfondo" | "badge";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  rarity: ShopRarity;
  costXp: number;
  previewClass: string;
  avatarId?: AvatarId;
}

export interface TournamentEntry {
  id: string;
  title: string;
  cadence: "Giornaliero" | "Settimanale";
  format: "Individuale" | "A Squadre";
  gameId: GameId;
  description: string;
  prizeLabel: string;
  prizeXp: number;
  joined: boolean;
  recordedScore: number | null;
  recordedMatches: number;
}

export type TeamRole = "Capitano" | "Stratega" | "Attaccante" | "Supporto";

export interface TeamMember {
  id: string;
  nickname: string;
  role: TeamRole;
}

export interface GamingTeam {
  id: string;
  name: string;
  logo: "shield" | "sword" | "bolt" | "crown";
  description: string;
  inviteCode: string;
  members: TeamMember[];
  strategies: string[];
  teamGoals: Array<{ id: string; text: string; done: boolean }>;
}

export interface SecretMission {
  id: string;
  title: string;
  hint: string;
  rewardXp: number;
  badgeName: string;
  isTimed?: boolean;
  expiresLabel?: string;
  metric:
    | "night_owl"
    | "coach_deep"
    | "replay_lab"
    | "team_player"
    | "zero_to_hero"
    | "multi_game";
  target: number;
}

export interface ScheduledWorkout {
  id: string;
  title: string;
  gameId: GameId;
  dateISO: string;
  time: string;
  reminderEnabled: boolean;
  completed: boolean;
}

export interface AccessibilitySettings {
  textSize: "normale" | "grande" | "molto-grande";
  bigButtons: boolean;
  highContrast: boolean;
  colorMode: "default" | "daltonismo" | "contrasto";
  simplifiedUi: boolean;
  reduceMotion: boolean;
}

export interface FoundTournament {
  id: string;
  name: string;
  gameName: string;
  dateTime: string;
  mode: string;
  participants: string;
  level: string;
  platform: string;
  locationType: string;
  requirements: string;
  ageLimit: string;
  prizes: string;
  rules: string;
  status: "Iscrizioni aperte" | "In corso" | "Concluso" | "Verifica sulla fonte";
  officialUrl: string;
  sourceName: string;
  lastUpdated: string;
}

export interface PersonalTournamentRecord {
  id: string;
  tournamentId: string;
  name: string;
  gameId: GameId;
  gameName: string;
  dateTime: string;
  mode: string;
  platform: string;
  officialUrl?: string;
  isFavorite: boolean;
  isUpcoming: boolean;
  placement?: string;
  score?: number;
  matchesPlayed?: number;
  notes?: string;
  completedAt?: string;
}

export interface LfgListing {
  id: string;
  authorNickname: string;
  authorAvatarId: AvatarId;
  authorLevel: PlayerLevel;
  gameId: GameId;
  customGameTitle?: string;
  roleWanted: string;
  mode: string;
  note: string;
  createdAt: string;
  moderationMethod: string;
}

export interface CommunityTournamentPost {
  id: string;
  organizerNickname: string;
  organizerAvatarId: AvatarId;
  title: string;
  gameId: GameId;
  customGameTitle?: string;
  mode: "Solo" | "Duo" | "Trio" | "Squadra";
  level: PlayerLevel;
  platform: string;
  dateLabel: string;
  rules: string;
  prizeLabel: string;
  participants: string[];
  results: Array<{ participant: string; score: number; note: string }>;
  updates: string[];
  createdAt: string;
  moderationMethod: string;
}

export interface GamerProfile {
  nickname: string;
  bio: string;
  avatarId: AvatarId;
  favoriteGameId: GameId;
  customGameTitle: string;
  level: PlayerLevel;
  coachPersonality: CoachPersonality;
  equippedFrameId: string;
  equippedBgId: string;
  equippedBadgeId: string;
  personalGoals: PersonalGoal[];
  weaknesses: string[];
}

export interface PlayerProgress {
  xp: number;
  spendableXp: number;
  streakDays: number;
  lastActiveDate: string;
  activeDates: string[];
  totalMinutes: number;
  completedWorkoutsCount: number;
  coachMessagesCount: number;
  mediaAnalysesCount: number;
  skills: Record<SkillKey, number>;
  gameMinutes: Record<GameId, number>;
  completedProgram7Days: number[];
  completedProgram30Days: number[];
  recentSessions: CompletedSession[];
  matchDiary: MatchLogEntry[];
  mediaAnalyses: MediaAnalysisRecord[];
}

export type ArcadeCategory = "online" | "offline" | "apk";

export type InstantPlayId = "aim" | "snake" | "2048" | "memory";

export interface ArcadeGameItem {
  id: string;
  packageName?: string;
  title: string;
  category: ArcadeCategory;
  alsoOffline?: boolean;
  genre: string;
  developer: string;
  description: string;
  imageUrl?: string;
  version?: string;
  versionCode?: number;
  sizeLabel?: string;
  requiresInternet: boolean;
  worksOffline: boolean;
  multiplayer: boolean;
  instantPlayMode?: "native" | "external";
  instantPlayId?: InstantPlayId;
  officialUrl: string;
  profileUrl?: string;
  storePageUrl?: string;
  playStoreUrl?: string;
  apkDownloadUrl?: string;
  apkAvailable: boolean;
  unavailableReason?: string;
  sourceName: string;
  sourceDomain: string;
  verifiedSource: boolean;
  platformLabel: string;
  requirements: string;
  releaseDate?: string;
}

export interface ArcadeReportItem {
  id: string;
  targetTitle: string;
  targetUrl: string;
  reason: string;
  createdAt: string;
  status: "Segnalato per revisione" | "Bloccato da GameCheck";
}

export interface GameCheckResult {
  checkedUrl: string;
  domain: string;
  isHttps: boolean;
  provenanceStatus: "VERIFICATO" | "NON VERIFICATO" | "SOSPETTO";
  officialSourceLabel: string;
  reachable: boolean | null;
  httpStatus: number | null;
  contentLengthLabel: string | null;
  warnings: string[];
  antivirusDisclaimer: string;
  checkedAt: string;
}

export interface AppPersistedState {
  profile: GamerProfile;
  activeGameId: GameId;
  dailyGoals: DailyGoal[];
  customWorkouts: Workout[];
  progress: PlayerProgress;
  messages: ChatMessage[];
  communityPosts: CommunityPost[];
  blockedUsers: string[];
  communityReports: CommunityReport[];
  followedTopics: string[];
  followedCreators: string[];
  followedTournamentIds: string[];
  lfgListings: LfgListing[];
  communityTournaments: CommunityTournamentPost[];
  purchasedItemIds: string[];
  tournaments: TournamentEntry[];
  personalTournaments: PersonalTournamentRecord[];
  team: GamingTeam | null;
  scheduledWorkouts: ScheduledWorkout[];
  accessibility: AccessibilitySettings;
  arcadeFavorites?: string[];
  arcadeRatings?: Record<string, number>;
  arcadeReports?: ArcadeReportItem[];
}


