import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  Dumbbell,
  FileVideo,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  Send,
  Swords,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import type {
  ChatMessage,
  CoachPersonality,
  GameInfo,
  GamerProfile,
  MediaAnalysisRecord,
  PlayerProgress,
  SkillKey,
  Workout,
} from "../types";
import { COACH_PERSONALITIES, SKILL_LABELS } from "../data/games";

export type CoachSubMode = "free" | "postmatch" | "media";

interface CoachViewProps {
  profile: GamerProfile;
  activeGame: GameInfo;
  displayGameName: string;
  progress: PlayerProgress;
  messages: ChatMessage[];
  initialMode?: CoachSubMode;
  onModeConsumed?: () => void;
  onChangePersonality: (personality: CoachPersonality) => void;
  onAddMessage: (msg: ChatMessage) => void;
  onDetectWeakness: (weakness: string) => void;
  onStartAssignedWorkout: (workout: Workout) => void;
  onSaveMediaAnalysis: (record: MediaAnalysisRecord) => void;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

const POST_MATCH_PROMPTS = [
  "Ho appena perso una partita: ero nervoso e ho sbagliato le scelte finali.",
  "Ho vinto ma sento di aver sprecato troppe occasioni per colpa della mira.",
  "Mi eliminano sempre alle spalle o fuori posizione, cosa sto sbagliando?",
];

export const CoachView: React.FC<CoachViewProps> = ({
  profile,
  activeGame,
  displayGameName,
  progress,
  messages,
  initialMode = "free",
  onModeConsumed,
  onChangePersonality,
  onAddMessage,
  onDetectWeakness,
  onStartAssignedWorkout,
  onSaveMediaAnalysis,
}) => {
  const [coachMode, setCoachMode] = useState<CoachSubMode>(initialMode);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);

  // Media analysis states
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaNote, setMediaNote] = useState("");
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialMode) {
      setCoachMode(initialMode);
      onModeConsumed?.();
    }
  }, [initialMode, onModeConsumed]);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    if (win.SpeechRecognition || win.webkitSpeechRecognition) {
      setMicSupported(true);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (coachMode !== "media") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, coachMode]);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const speakWithBrowserFallback = (text: string, msgId: string) => {
    if (!("speechSynthesis" in window)) {
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";
    utterance.rate = 1.02;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const speakCoachText = async (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    setSpeakingMessageId(msgId);

    try {
      const res = await fetch("/api/coach/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        speakWithBrowserFallback(text, msgId);
        return;
      }

      const data = (await res.json()) as { audioBase64?: string };
      if (!data.audioBase64) {
        speakWithBrowserFallback(text, msgId);
        return;
      }

      const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => setSpeakingMessageId(null);
      audio.onerror = () => speakWithBrowserFallback(text, msgId);
      await audio.play();
    } catch {
      speakWithBrowserFallback(text, msgId);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      gameId: activeGame.id,
    };

    onAddMessage(userMsg);
    setInput("");
    setIsSending(true);

    try {
      const statsSummary = `${progress.completedWorkoutsCount} allenamenti completati, ${progress.totalMinutes} minuti, ${progress.xp} XP, serie di ${progress.streakDays} giorni.`;
      const recentMatchesSummary = progress.matchDiary
        .slice(0, 3)
        .map(
          (m) =>
            `${m.outcome} (${m.durationMinutes} min, errore: ${
              m.mistake || "nessuno indicato"
            })`
        )
        .join("; ");

      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          gameName: displayGameName,
          playerLevel: profile.level,
          nickname: profile.nickname,
          coachPersonality: profile.coachPersonality,
          mode: coachMode === "postmatch" ? "postmatch" : "free",
          weaknesses: profile.weaknesses,
          personalGoals: profile.personalGoals
            .filter((g) => !g.done)
            .map((g) => g.text),
          recentMatchesSummary,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
          statsSummary,
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        detectedWeakness?: string;
        assignedWorkout?: Omit<Workout, "gameId" | "difficulty"> | null;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Impossibile contattare il Coach AI.");
      }

      if (data.detectedWeakness) {
        onDetectWeakness(data.detectedWeakness);
      }

      const assignedWorkout: Workout | undefined = data.assignedWorkout
        ? {
            ...data.assignedWorkout,
            gameId: activeGame.id,
            difficulty: profile.level,
            missionTier: "Media",
          }
        : undefined;

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: "coach",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        gameId: activeGame.id,
        assignedWorkout,
      };

      onAddMessage(coachMsg);

      if (autoSpeak) {
        void speakCoachText(coachMsg.text, coachMsg.id);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Errore di connessione con il Coach AI. Riprova."
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleMicrophone = () => {
    if (!micSupported) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      setIsListening(false);
      if (transcript && transcript.trim()) {
        void sendMessage(transcript);
      }
    };
    rec.onerror = () => {
      setIsListening(false);
      setErrorMsg("Microfono non disponibile o nessun audio rilevato. Puoi scrivere qui sotto.");
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    setErrorMsg(null);
    setIsListening(true);
    rec.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setMediaError(null);
    if (!file) return;

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!allowed.includes(file.type)) {
      setMediaError(
        "Formato non supportato. Seleziona uno screenshot (PNG, JPG, WEBP) o una clip breve (MP4, WEBM)."
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMediaError(
        "File troppo grande (massimo 15 MB). Riduci la durata della clip o carica uno screenshot."
      );
      return;
    }

    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyzeMedia = async () => {
    if (!mediaFile || isAnalyzingMedia) return;
    setIsAnalyzingMedia(true);
    setMediaError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const commaIdx = result.indexOf(",");
          resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
        };
        reader.onerror = () => reject(new Error("Impossibile leggere il file selezionato."));
        reader.readAsDataURL(mediaFile);
      });

      const res = await fetch("/api/coach/analyze-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaBase64: base64,
          mimeType: mediaFile.type,
          note: mediaNote.trim(),
          gameName: displayGameName,
          playerLevel: profile.level,
        }),
      });

      const data = (await res.json()) as {
        analysis?: string;
        errors?: string[];
        keyMoments?: string[];
        improvements?: string[];
        detectedWeakness?: string;
        recommendedSkill?: SkillKey;
        suggestedWorkout?: Omit<Workout, "gameId" | "difficulty">;
        error?: string;
      };

      if (!res.ok || !data.analysis) {
        throw new Error(data.error || "Analisi non riuscita.");
      }

      if (data.detectedWeakness) {
        onDetectWeakness(data.detectedWeakness);
      }

      const suggestedWorkout: Workout | undefined = data.suggestedWorkout
        ? {
            ...data.suggestedWorkout,
            gameId: activeGame.id,
            difficulty: profile.level,
            missionTier: data.suggestedWorkout.missionTier || "Media",
          }
        : undefined;

      const record: MediaAnalysisRecord = {
        id: `media-${Date.now()}`,
        fileName: mediaFile.name,
        mediaType: mediaFile.type.startsWith("video/") ? "video" : "image",
        gameId: activeGame.id,
        note: mediaNote.trim(),
        analysis: data.analysis,
        errors: Array.isArray(data.errors) ? data.errors : [],
        keyMoments: Array.isArray(data.keyMoments) ? data.keyMoments : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
        detectedWeakness: data.detectedWeakness || undefined,
        recommendedSkill: data.recommendedSkill || "strategia",
        suggestedWorkout,
        createdAt: new Date().toLocaleString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      onSaveMediaAnalysis(record);
      setMediaFile(null);
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
        setMediaPreviewUrl(null);
      }
      setMediaNote("");
    } catch (err) {
      setMediaError(
        err instanceof Error
          ? err.message
          : "Errore durante l'analisi del file."
      );
    } finally {
      setIsAnalyzingMedia(false);
    }
  };

  const quickPrompts =
    coachMode === "postmatch" ? POST_MATCH_PROMPTS : activeGame.starterQuestions;

  return (
    <div className="space-y-6">
      {/* Coach Mode Switcher */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-[#0F172A] border border-white/10 p-2">
        <button
          type="button"
          onClick={() => setCoachMode("free")}
          className={`min-h-[48px] flex-1 min-w-[150px] px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            coachMode === "free"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Coach Personale
        </button>

        <button
          type="button"
          onClick={() => setCoachMode("postmatch")}
          className={`min-h-[48px] flex-1 min-w-[150px] px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            coachMode === "postmatch"
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Swords className="w-5 h-5" />
          Analisi Post-Partita
        </button>

        <button
          type="button"
          onClick={() => setCoachMode("media")}
          className={`min-h-[48px] flex-1 min-w-[150px] px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            coachMode === "media"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Camera className="w-5 h-5" />
          Replay Lab (Clip & Foto)
        </button>
      </div>

      {coachMode === "media" ? (
        /* ANALISI AVANZATA MEDIA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-6 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Replay Lab · Analisi Reale AI · {displayGameName}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                Carica Screenshot o Clip Video
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                Carica un'immagine o una clip breve (MP4/WEBM max 15 MB). Replay Lab
                individua errori, momenti chiave e consigli reali tramite Gemini, senza
                mai inventare dati se il file non è leggibile.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[112px] rounded-2xl border-2 border-dashed border-blue-500/40 hover:border-blue-400 bg-[#141E34] p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-blue-400" />
              <span className="text-base font-bold text-white">
                {mediaFile ? mediaFile.name : "Tocca per scegliere Screenshot o Video"}
              </span>
              <span className="text-xs text-slate-400">
                PNG, JPG, WEBP, MP4, WEBM · Limite massimo 15 MB
              </span>
            </button>

            {mediaPreviewUrl && mediaFile && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                {mediaFile.type.startsWith("video/") ? (
                  <video
                    src={mediaPreviewUrl}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                ) : (
                  <img
                    src={mediaPreviewUrl}
                    alt="Anteprima partita caricata"
                    className="w-full max-h-64 object-contain"
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="media-note"
                className="text-sm font-semibold text-slate-300 block"
              >
                Cosa vuoi far controllare al Coach? (opzionale)
              </label>
              <input
                id="media-note"
                type="text"
                value={mediaNote}
                onChange={(e) => setMediaNote(e.target.value)}
                placeholder="Es. Controlla la mia posizione o perché ho perso questo duello"
                className="w-full min-h-[50px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {mediaError && (
              <div
                role="alert"
                className="rounded-2xl bg-rose-950/50 border border-rose-500/40 px-4 py-3 flex items-start gap-3 text-rose-200 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                <span>{mediaError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={!mediaFile || isAnalyzingMedia}
              onClick={() => void handleAnalyzeMedia()}
              className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all"
            >
              {isAnalyzingMedia ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analisi Replay Lab in corso...
                </>
              ) : (
                <>
                  <FileVideo className="w-5 h-5" />
                  Avvia Analisi Replay Lab
                </>
              )}
            </button>
          </section>

          <section className="lg:col-span-6 rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Risultati Replay Lab
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Errori, momenti chiave e allenamenti generati dalle tue clip o foto
              </p>
            </div>

            {progress.mediaAnalyses.length === 0 ? (
              <div className="rounded-2xl bg-[#141E34] border border-white/10 p-6 text-center space-y-2">
                <p className="text-base font-semibold text-white">
                  Nessun replay analizzato ancora
                </p>
                <p className="text-sm text-slate-400">
                  Carica uno screenshot o una clip a fianco per ricevere analisi e
                  un esercizio personalizzato da Coach Marco.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.mediaAnalyses.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl bg-[#162038] border border-white/10 p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-blue-400">
                        {item.fileName} · {item.mediaType === "video" ? "Clip Video" : "Screenshot"}
                      </span>
                      <span className="tabular-nums">{item.createdAt}</span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-line">
                      {item.analysis}
                    </p>

                    {item.errors && item.errors.length > 0 && (
                      <div className="rounded-xl bg-[#0B101D] border border-rose-500/25 p-3 space-y-1">
                        <p className="text-xs font-bold text-rose-300">Errori individuati</p>
                        <ul className="text-xs text-slate-200 space-y-1">
                          {item.errors.map((err, i) => (
                            <li key={i}>· {err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.keyMoments && item.keyMoments.length > 0 && (
                      <div className="rounded-xl bg-[#0B101D] border border-blue-500/25 p-3 space-y-1">
                        <p className="text-xs font-bold text-blue-300">Momenti importanti</p>
                        <ul className="text-xs text-slate-200 space-y-1">
                          {item.keyMoments.map((km, i) => (
                            <li key={i}>· {km}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.improvements && item.improvements.length > 0 && (
                      <div className="rounded-xl bg-[#0B101D] border border-emerald-500/25 p-3 space-y-1">
                        <p className="text-xs font-bold text-emerald-300">Come migliorare</p>
                        <ul className="text-xs text-slate-200 space-y-1">
                          {item.improvements.map((imp, i) => (
                            <li key={i}>· {imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs font-semibold text-violet-300">
                      Abilità consigliata: {SKILL_LABELS[item.recommendedSkill]}
                      {item.detectedWeakness ? ` · Punto debole: ${item.detectedWeakness}` : ""}
                    </p>

                    {item.suggestedWorkout && (
                      <button
                        type="button"
                        onClick={() => onStartAssignedWorkout(item.suggestedWorkout!)}
                        className="w-full min-h-[46px] rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Avvia Allenamento da Replay: {item.suggestedWorkout.title}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* CHAT COACH PERSONALE & ANALISI POST-PARTITA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 border border-white/15">
                  <img
                    src="/src/assets/images/coach_avatar_1794854815932.jpg"
                    alt="Coach Marco"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Coach Marco</h1>
                  <p className="text-sm text-blue-400 font-medium">
                    {displayGameName} · {profile.level}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {coachMode === "postmatch"
                  ? "Raccontami com'è andata la partita: analizziamo gli errori insieme e ti assegno subito l'esercizio giusto."
                  : `Ciao ${profile.nickname}, seguo i tuoi progressi e ricordo i tuoi punti deboli per farti salire di livello.`}
              </p>

              {/* Personalità Coach AI */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-slate-400">
                  Personalità di Coach Marco
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {COACH_PERSONALITIES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      title={p.description}
                      onClick={() => onChangePersonality(p.id)}
                      className={`min-h-[44px] px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        profile.coachPersonality === p.id
                          ? "bg-blue-600 text-white"
                          : "bg-[#141E34] border border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {COACH_PERSONALITIES.find((c) => c.id === profile.coachPersonality)?.description}
                </p>
              </div>

              {profile.weaknesses.length > 0 && (
                <div className="rounded-2xl bg-[#141E34] border border-white/10 p-4 space-y-1.5">
                  <p className="text-xs font-bold text-violet-300">
                    Punti deboli individuati finora
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {profile.weaknesses.slice(0, 3).map((w) => (
                      <li key={w}>· {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (autoSpeak) stopAllAudio();
                  setAutoSpeak((v) => !v);
                }}
                className={`w-full min-h-[52px] px-4 rounded-2xl border font-semibold text-sm flex items-center justify-between cursor-pointer transition-colors ${
                  autoSpeak
                    ? "bg-violet-600/20 border-violet-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {autoSpeak ? (
                    <Volume2 className="w-5 h-5 text-violet-300" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                  Voce automatica Coach
                </span>
                <span className="text-xs font-bold text-violet-300">
                  {autoSpeak ? "Attiva" : "Spenta"}
                </span>
              </button>
            </div>

            <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 space-y-3">
              <h2 className="text-lg font-bold text-white">
                {coachMode === "postmatch"
                  ? "Racconta la partita"
                  : `Spunti per ${displayGameName}`}
              </h2>
              <div className="space-y-2.5">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isSending}
                    onClick={() => void sendMessage(q)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-[#162038] hover:bg-blue-600/25 border border-white/10 hover:border-blue-500/50 text-left text-sm font-medium text-slate-100 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8 rounded-3xl bg-[#0F172A] border border-white/10 flex flex-col min-h-[540px] lg:h-[680px]">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isCoach = msg.role === "coach";
                const isSpeakingThis = speakingMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[82%] rounded-2xl px-5 py-4 space-y-3 ${
                        isCoach
                          ? "bg-[#162038] border border-white/10 text-slate-100"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-xs opacity-75">
                        <span className="font-semibold">
                          {isCoach ? "Coach Marco" : profile.nickname}
                        </span>
                        <span className="tabular-nums">{msg.timestamp}</span>
                      </div>

                      <p className="text-base leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>

                      {isCoach && msg.assignedWorkout && (
                        <div className="rounded-xl bg-[#0B101D] border border-violet-500/40 p-4 space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                            <Dumbbell className="w-4 h-4" />
                            Allenamento assegnato dal Coach ·{" "}
                            {msg.assignedWorkout.durationMinutes} min ·{" "}
                            {SKILL_LABELS[msg.assignedWorkout.skillCategory]}
                          </div>
                          <p className="font-bold text-white text-base">
                            {msg.assignedWorkout.title}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              onStartAssignedWorkout(msg.assignedWorkout!)
                            }
                            className="w-full min-h-[48px] rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            Avvia Allenamento Assegnato
                          </button>
                        </div>
                      )}

                      {isCoach && (
                        <div>
                          <button
                            type="button"
                            onClick={() => void speakCoachText(msg.text, msg.id)}
                            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                              isSpeakingThis
                                ? "bg-violet-600 text-white"
                                : "bg-white/10 hover:bg-white/15 text-slate-200"
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                            {isSpeakingThis ? "Ferma audio" : "Ascolta risposta"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[#162038] border border-white/10 px-5 py-4 flex items-center gap-3 text-slate-300">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-base">
                      Coach Marco sta analizzando...
                    </span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-2xl bg-rose-950/50 border border-rose-500/40 px-5 py-4 flex items-start gap-3 text-rose-200"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                  <p className="text-sm sm:text-base">{errorMsg}</p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
              className="border-t border-white/10 p-4 sm:p-5 bg-[#0B101D] rounded-b-3xl"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                  {micSupported && (
                    <button
                      type="button"
                      onClick={toggleMicrophone}
                      aria-label={
                        isListening ? "Ferma microfono" : "Parla al microfono"
                      }
                      className={`min-h-[54px] min-w-[54px] px-4 rounded-2xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        isListening
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/40 text-violet-200"
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                      <span className="hidden sm:inline text-sm">
                        {isListening ? "Ascolto..." : "Voce"}
                      </span>
                    </button>
                  )}

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      coachMode === "postmatch"
                        ? `Racconta cosa è successo nella partita di ${displayGameName}...`
                        : `Parla con Coach Marco di ${displayGameName}...`
                    }
                    className="w-full min-h-[54px] rounded-2xl bg-[#141E34] border border-white/15 px-4 text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="min-h-[54px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Invia
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
