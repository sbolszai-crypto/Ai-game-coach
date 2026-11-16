import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Chiave API Gemini mancante sul server. Configura GEMINI_API_KEY nei Secrets per attivare il Coach AI."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("GEMINI_API_KEY") || raw.includes("API_KEY_INVALID") || raw.includes("403")) {
    return {
      status: 400,
      message:
        "Servizio AI non attivo: chiave API Gemini mancante o non valida nelle impostazioni Secrets.",
    };
  }
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      message: "Troppe richieste in questo momento. Attendi qualche secondo e riprova.",
    };
  }
  return {
    status: 500,
    message: raw || "Errore temporaneo del servizio Coach AI. Riprova tra poco.",
  };
}

const ALLOWED_SKILLS = [
  "mira",
  "riflessi",
  "movimento",
  "costruzione",
  "strategia",
  "precisione",
  "tattica",
  "decisioni",
];

function normalizeSkill(input?: string): string {
  const val = String(input || "").toLowerCase().trim();
  return ALLOWED_SKILLS.includes(val) ? val : "strategia";
}

interface ChatHistoryItem {
  role: "user" | "coach";
  text: string;
}

interface CatalogGameItem {
  id: string;
  name: string;
  genre: string;
  developer: string;
}

function loadGamesCatalog(): CatalogGameItem[] {
  try {
    const catalogPath = path.resolve(__dirname, "data/games_catalog.json");
    if (!fs.existsSync(catalogPath)) return [];
    const raw = fs.readFileSync(catalogPath, "utf8");
    const parsed = JSON.parse(raw) as CatalogGameItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface ArcadeCatalogFile {
  generatedAt: string;
  onlineGames: unknown[];
  offlineGames: unknown[];
  apkGames: unknown[];
}

function loadArcadeCatalog(): ArcadeCatalogFile {
  try {
    const arcadePath = path.resolve(__dirname, "data/arcade_catalog.json");
    if (!fs.existsSync(arcadePath)) {
      return { generatedAt: "", onlineGames: [], offlineGames: [], apkGames: [] };
    }
    const raw = fs.readFileSync(arcadePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ArcadeCatalogFile>;
    return {
      generatedAt: String(parsed.generatedAt || ""),
      onlineGames: Array.isArray(parsed.onlineGames) ? parsed.onlineGames : [],
      offlineGames: Array.isArray(parsed.offlineGames) ? parsed.offlineGames : [],
      apkGames: Array.isArray(parsed.apkGames) ? parsed.apkGames : [],
    };
  } catch {
    return { generatedAt: "", onlineGames: [], offlineGames: [], apkGames: [] };
  }
}

const VERIFIED_ARCADE_DOMAINS: Array<{ domain: string; label: string }> = [
  { domain: "f-droid.org", label: "F-Droid Repository Ufficiale" },
  { domain: "github.com", label: "GitHub Releases Ufficiale (verifica autore)" },
  { domain: "play.google.com", label: "Google Play Store Ufficiale" },
  { domain: "apps.apple.com", label: "Apple App Store Ufficiale" },
  { domain: "store.steampowered.com", label: "Steam Store Ufficiale" },
  { domain: "itch.io", label: "itch.io Portale Indie" },
  { domain: "freetogame.com", label: "FreeToGame Portale Verificato" },
  { domain: "mindustrygame.github.io", label: "Sito Ufficiale Mindustry" },
  { domain: "shatteredpixel.com", label: "Sito Ufficiale Shattered Pixel" },
  { domain: "supertuxkart.net", label: "Sito Ufficiale SuperTuxKart" },
  { domain: "luanti.org", label: "Sito Ufficiale Luanti" },
  { domain: "wesnoth.org", label: "Sito Ufficiale Battle for Wesnoth" },
  { domain: "lichess.org", label: "Sito Ufficiale Lichess" },
  { domain: "chris.boyle.name", label: "Sito Ufficiale SGT Puzzles Android" },
  { domain: "secuso.aifb.kit.edu", label: "Gruppo Ricerca SECUSO (TU Darmstadt)" },
  { domain: "stardewvalley.net", label: "Sito Ufficiale Stardew Valley" },
  { domain: "terraria.org", label: "Sito Ufficiale Terraria" },
  { domain: "dead-cells.com", label: "Sito Ufficiale Dead Cells" },
];

const SUSPICIOUS_URL_REGEX =
  /(apkpure|happymod|moddroid|an1\.com|rexdl|revdl|apkmonk|apkmirror-mod|cracked|warez|keygen|nulled|mod-apk|modded|cheat-apk|bit\.ly|tinyurl\.com|t\.me|mediafire|mega\.nz)/i;

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h.endsWith(".local") ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^169\.254\./.test(h)
  ) {
    return true;
  }
  return false;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  const gamesCatalog = loadGamesCatalog();
  const arcadeCatalog = loadArcadeCatalog();
  const catalogGenres = Array.from(
    new Set(gamesCatalog.map((g) => g.genre))
  ).sort();

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      catalogCount: gamesCatalog.length,
      arcadeCounts: {
        online: arcadeCatalog.onlineGames.length,
        offline: arcadeCatalog.offlineGames.length,
        apk: arcadeCatalog.apkGames.length,
      },
    });
  });

  app.get("/api/arcade", (_req, res) => {
    res.json({
      generatedAt: arcadeCatalog.generatedAt,
      onlineGames: arcadeCatalog.onlineGames,
      offlineGames: arcadeCatalog.offlineGames,
      apkGames: arcadeCatalog.apkGames,
    });
  });

  app.post("/api/arcade/gamecheck", async (req, res) => {
    const { url = "", title = "" } = req.body as {
      url?: string;
      title?: string;
    };
    const rawUrl = String(url).trim();
    const checkedAt = new Date().toLocaleString("it-IT");
    const antivirusDisclaimer =
      "GAMECHECK verifica esclusivamente la provenienza del link, il protocollo HTTPS, la presenza nella lista di fonti ufficiali/autorizzate e lo stato di raggiungibilità HTTP. NON esegue alcuna scansione antivirus sul dispositivo e non sostituisce Google Play Protect o un software antivirus locale.";

    if (!rawUrl) {
      res.status(400).json({ error: "Inserisci un link o un URL APK da verificare." });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      res.json({
        checkedUrl: rawUrl,
        domain: "Non valido",
        isHttps: false,
        provenanceStatus: "SOSPETTO",
        officialSourceLabel: "URL non valido o malformato",
        reachable: false,
        httpStatus: null,
        contentLengthLabel: null,
        warnings: [
          "L'indirizzo inserito non è un URL valido. Non scaricare file da link incompleti o offuscati.",
        ],
        antivirusDisclaimer,
        checkedAt,
      });
      return;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isHttps = parsedUrl.protocol === "https:";
    const warnings: string[] = [];

    if (!isHttps) {
      warnings.push(
        "Connessione non cifrata (non HTTPS): un file scaricato senza HTTPS può essere intercettato o alterato."
      );
    }

    if (isPrivateHostname(hostname)) {
      res.json({
        checkedUrl: rawUrl,
        domain: hostname,
        isHttps,
        provenanceStatus: "SOSPETTO",
        officialSourceLabel: "Indirizzo locale o privato non consentito",
        reachable: false,
        httpStatus: null,
        contentLengthLabel: null,
        warnings: [
          "Indirizzo di rete locale o privato bloccato per motivi di sicurezza.",
        ],
        antivirusDisclaimer,
        checkedAt,
      });
      return;
    }

    const isSuspiciousPattern = SUSPICIOUS_URL_REGEX.test(rawUrl);
    if (isSuspiciousPattern) {
      warnings.push(
        "Rilevato dominio o parola chiave associata a repository APK non ufficiali, mod non autorizzate o shortener di link."
      );
    }

    const matchedSource = VERIFIED_ARCADE_DOMAINS.find(
      (entry) => hostname === entry.domain || hostname.endsWith(`.${entry.domain}`)
    );

    let githubIsOfficialRelease = true;
    if (hostname === "github.com" || hostname.endsWith(".github.com")) {
      const hasReleasesPath =
        parsedUrl.pathname.includes("/releases/") ||
        parsedUrl.pathname.split("/").filter(Boolean).length >= 2;
      if (!hasReleasesPath) {
        githubIsOfficialRelease = false;
      }
    }

    let provenanceStatus: "VERIFICATO" | "NON VERIFICATO" | "SOSPETTO" =
      "NON VERIFICATO";
    let officialSourceLabel = "Fonte esterna non presente nella lista ufficiale GAMECOACH";

    if (isSuspiciousPattern || !isHttps) {
      provenanceStatus = "SOSPETTO";
      officialSourceLabel = isSuspiciousPattern
        ? "Fonte potenzialmente non sicura o non autorizzata"
        : "Protocollo non HTTPS";
    } else if (matchedSource && githubIsOfficialRelease) {
      provenanceStatus = "VERIFICATO";
      officialSourceLabel = matchedSource.label;
    } else {
      warnings.push(
        "Questo dominio non appartiene alla lista di store ufficiali o repository open-source verificati da GAMECOACH AI."
      );
    }

    if (rawUrl.toLowerCase().includes(".apk")) {
      warnings.push(
        "Ricorda: prima di installare manualmente un file APK su Android, controlla i permessi richiesti e confronta la firma o lo SHA-256 con la pagina dello sviluppatore."
      );
    }

    let reachable: boolean | null = null;
    let httpStatus: number | null = null;
    let contentLengthLabel: string | null = null;

    if (isHttps && matchedSource && !isSuspiciousPattern) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const headRes = await fetch(parsedUrl.toString(), {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timer);
        httpStatus = headRes.status;
        reachable = headRes.ok;
        const len = Number(headRes.headers.get("content-length") || 0);
        if (len > 0) {
          contentLengthLabel = `${(len / (1024 * 1024)).toFixed(1)} MB`;
        }
      } catch {
        reachable = null;
      }
    }

    res.json({
      checkedUrl: parsedUrl.toString(),
      domain: hostname,
      isHttps,
      provenanceStatus,
      officialSourceLabel: title ? `${officialSourceLabel} · ${title}` : officialSourceLabel,
      reachable,
      httpStatus,
      contentLengthLabel,
      warnings,
      antivirusDisclaimer,
      checkedAt,
    });
  });

  app.get("/api/games", (req, res) => {
    const q = String(req.query.q || "").trim().toLowerCase();
    const genre = String(req.query.genre || "Tutti").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(12, Math.min(60, Number(req.query.limit) || 24));

    let filtered = gamesCatalog;
    if (genre && genre !== "Tutti") {
      filtered = filtered.filter((g) => g.genre === genre);
    }
    if (q) {
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q)
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;

    res.json({
      totalCatalogCount: gamesCatalog.length,
      filteredCount: filtered.length,
      page: safePage,
      totalPages,
      genres: catalogGenres,
      games: filtered.slice(start, start + limit),
    });
  });

  app.post("/api/coach/chat", async (req, res) => {
    try {
      const {
        message,
        gameName = "Fortnite",
        playerLevel = "Principiante",
        nickname = "Giocatore",
        coachPersonality = "motivatore",
        mode = "free",
        weaknesses = [],
        personalGoals = [],
        recentMatchesSummary = "",
        history = [],
        statsSummary = "",
      } = req.body as {
        message?: string;
        gameName?: string;
        playerLevel?: string;
        nickname?: string;
        coachPersonality?: "motivatore" | "stratega" | "severo" | "amichevole";
        mode?: "free" | "postmatch";
        weaknesses?: string[];
        personalGoals?: string[];
        recentMatchesSummary?: string;
        history?: ChatHistoryItem[];
        statsSummary?: string;
      };

      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "Scrivi o pronuncia un messaggio per il Coach." });
        return;
      }

      const ai = getAiClient();

      const recentContext = Array.isArray(history)
        ? history
            .slice(-8)
            .map((m) => `${m.role === "user" ? nickname : "Coach Marco"}: ${m.text}`)
            .join("\n")
        : "";

      const personalityMap: Record<string, string> = {
        motivatore:
          "Stile MOTIVATORE: energico, positivo, esalta i progressi e trasforma ogni sconfitta in carburante per migliorare.",
        stratega:
          "Stile STRATEGA: analitico, lucido, ragiona su mappa, tempi, rotazioni e decisioni tattiche passo dopo passo.",
        severo:
          "Stile SEVERO MA RISPETTOSO: esigente, diretto sugli errori senza giri di parole ma sempre educato, mai offensivo né umiliante, focalizzato sulla disciplina.",
        amichevole:
          "Stile AMICHEVOLE: calmo, paziente, rassicurante e semplice, perfetto per chi parte da zero o gioca per divertirsi.",
      };

      const personalityGuide =
        personalityMap[coachPersonality] ?? personalityMap.motivatore;

      const modeInstructions =
        mode === "postmatch"
          ? `Modalità attiva: ANALISI POST-PARTITA. Fai domande mirate per capire cosa è successo nella partita (errori di posizione, scelte affrettate, mira, gestione risorse), sostieni il morale dopo le sconfitte e proponi un esercizio mirato se emerge un errore chiaro.`
          : `Modalità attiva: COACH PERSONALE. Ascolta il giocatore, rispondi secondo la tua personalità, fai una domanda di approfondimento utile e guida i suoi progressi.`;

      const systemInstruction = `Sei Coach Marco, il vero allenatore personale di GAMECOACH AI.
${personalityGuide}
Parli sempre in italiano naturale e rispettoso (non insultare né umiliare mai il giocatore).

Profilo dell'atleta:
- Nickname: ${nickname}
- Gioco attuale: ${gameName}
- Livello: ${playerLevel}
- Punti deboli noti: ${weaknesses.length > 0 ? weaknesses.join(", ") : "nessuno registrato finora"}
- Obiettivi personali: ${personalGoals.length > 0 ? personalGoals.join(", ") : "migliorare partita dopo partita"}
- Statistiche reali registrate: ${statsSummary || "nessun allenamento registrato ancora"}
- Ultime partite dal diario: ${recentMatchesSummary || "nessuna partita registrata"}

${modeInstructions}

Linee guida:
1. Adatta linguaggio e tattiche al livello ${playerLevel} e al gioco ${gameName}.
2. Restituisci sempre JSON valido secondo lo schema:
   - "reply": la risposta conversazionale del coach.
   - "detectedWeakness": stringa opzionale (o "") con un punto debole breve emerso.
   - "assignWorkout": true SOLO se ha senso assegnare subito un esercizio specifico per correggere un errore discusso, altrimenti false.
   - Se assignWorkout è true, compila "workoutTitle", "workoutDescription", "skillCategory" (una tra: mira, riflessi, movimento, costruzione, strategia, precisione, tattica, decisioni) e 3 "steps".`;

      const prompt = recentContext
        ? `Conversazione recente:\n${recentContext}\n\nMessaggio attuale di ${nickname}: ${message.trim()}`
        : `Messaggio di ${nickname}: ${message.trim()}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              detectedWeakness: { type: Type.STRING },
              assignWorkout: { type: Type.BOOLEAN },
              workoutTitle: { type: Type.STRING },
              workoutDescription: { type: Type.STRING },
              skillCategory: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    seconds: { type: Type.INTEGER },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim()) as {
        reply?: string;
        detectedWeakness?: string;
        assignWorkout?: boolean;
        workoutTitle?: string;
        workoutDescription?: string;
        skillCategory?: string;
        steps?: Array<{ title?: string; instruction?: string; seconds?: number }>;
      };

      const reply = parsed.reply?.trim();
      if (!reply) {
        throw new Error("Il Coach AI non ha restituito una risposta valida. Riprova.");
      }

      let assignedWorkout = null;
      if (parsed.assignWorkout && parsed.workoutTitle) {
        const steps =
          Array.isArray(parsed.steps) && parsed.steps.length > 0
            ? parsed.steps.slice(0, 4).map((s, idx) => ({
                id: `coach-step-${Date.now()}-${idx}`,
                title: s.title || `Passo ${idx + 1}`,
                instruction:
                  s.instruction || "Esegui l'esercizio mantenendo il controllo.",
                seconds: Math.max(45, Math.min(240, Number(s.seconds) || 90)),
              }))
            : [
                {
                  id: `coach-step-${Date.now()}-0`,
                  title: "Esercizio correttivo",
                  instruction: `Applica il consiglio su ${gameName} con ritmo controllato.`,
                  seconds: 120,
                },
                {
                  id: `coach-step-${Date.now()}-1`,
                  title: "Verifica in partita",
                  instruction:
                    "Ripeti l'azione in una partita breve concentrandoti su questo singolo dettaglio.",
                  seconds: 180,
                },
              ];

        const totalMins = Math.max(
          5,
          Math.round(steps.reduce((acc, s) => acc + s.seconds, 0) / 60)
        );

        assignedWorkout = {
          id: `coach-assigned-${Date.now()}`,
          title: parsed.workoutTitle,
          description:
            parsed.workoutDescription ||
            `Allenamento assegnato da Coach Marco per ${gameName}.`,
          durationMinutes: totalMins,
          xpReward: totalMins * 7,
          skillCategory: normalizeSkill(parsed.skillCategory),
          isCustom: true,
          steps,
        };
      }

      res.json({
        reply,
        detectedWeakness: parsed.detectedWeakness?.trim() || "",
        assignedWorkout,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post("/api/coach/analyze-media", async (req, res) => {
    try {
      const {
        mediaBase64,
        mimeType,
        note = "",
        gameName = "Fortnite",
        playerLevel = "Principiante",
      } = req.body as {
        mediaBase64?: string;
        mimeType?: string;
        note?: string;
        gameName?: string;
        playerLevel?: string;
      };

      const supportedImages = ["image/png", "image/jpeg", "image/webp"];
      const supportedVideos = ["video/mp4", "video/webm"];
      const allSupported = [...supportedImages, ...supportedVideos];

      if (!mediaBase64 || !mimeType || !allSupported.includes(mimeType)) {
        res.status(400).json({
          error:
            "Formato non supportato. Carica uno screenshot (PNG, JPG, WEBP) o una breve clip video (MP4, WEBM).",
        });
        return;
      }

      if (mediaBase64.length > 22 * 1024 * 1024) {
        res.status(400).json({
          error:
            "Il file supera il limite di 15 MB. Ritaglia una clip più breve o carica uno screenshot.",
        });
        return;
      }

      const ai = getAiClient();
      const isVideo = supportedVideos.includes(mimeType);

      const promptText = `Sei Coach Marco di GAMECOACH AI (Replay Lab).
Analizza questo ${isVideo ? "breve video di gameplay" : "screenshot di partita"} relativo a ${gameName} (livello giocatore: ${playerLevel}).
${note ? `Nota del giocatore: "${note}"` : ""}

Regola di onestà assoluta:
- Basati SOLO su ciò che si vede realmente nel file. Se l'immagine o clip non mostra una partita chiara o è troppo sfocata, dillo chiaramente senza inventare.
- Restituisci JSON strutturato con:
  - "analysis": sintesi chiara in italiano.
  - "errors": array di 1-3 errori o criticità visibili (o indicazioni se non chiari).
  - "keyMoments": array di 1-3 momenti chiave osservati nel file.
  - "improvements": array di 2-3 azioni concrete per migliorare.
  - "detectedWeakness": eventuale punto debole breve (o stringa vuota).
  - "recommendedSkill": una tra mira, riflessi, movimento, costruzione, strategia, precisione, tattica, decisioni.
  - "workoutTitle": titolo breve di un esercizio correttivo basato sull'analisi.
  - "workoutInstruction": istruzione pratica di 1-2 frasi per allenare questo aspetto.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: mediaBase64,
              },
            },
            { text: promptText },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              errors: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyMoments: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              detectedWeakness: { type: Type.STRING },
              recommendedSkill: { type: Type.STRING },
              workoutTitle: { type: Type.STRING },
              workoutInstruction: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim()) as {
        analysis?: string;
        errors?: string[];
        keyMoments?: string[];
        improvements?: string[];
        detectedWeakness?: string;
        recommendedSkill?: string;
        workoutTitle?: string;
        workoutInstruction?: string;
      };

      if (!parsed.analysis?.trim()) {
        throw new Error("Analisi non completata. Riprova con un file più nitido.");
      }

      const skill = normalizeSkill(parsed.recommendedSkill);
      const suggestedWorkout = parsed.workoutTitle
        ? {
            id: `replay-workout-${Date.now()}`,
            title: parsed.workoutTitle,
            description:
              parsed.workoutInstruction ||
              `Esercizio generato da Replay Lab per ${gameName}.`,
            durationMinutes: 6,
            xpReward: 45,
            skillCategory: skill,
            missionTier: "Media",
            isCustom: true,
            steps: [
              {
                id: `rw-step-1-${Date.now()}`,
                title: "Correzione mirata",
                instruction:
                  parsed.workoutInstruction ||
                  "Applica la correzione suggerita da Replay Lab con ritmo controllato.",
                seconds: 180,
              },
              {
                id: `rw-step-2-${Date.now()}`,
                title: "Verifica in partita",
                instruction:
                  "Ripeti subito in partita prestando attenzione al singolo dettaglio emerso.",
                seconds: 180,
              },
            ],
          }
        : undefined;

      res.json({
        analysis: parsed.analysis.trim(),
        errors: Array.isArray(parsed.errors) ? parsed.errors.slice(0, 3) : [],
        keyMoments: Array.isArray(parsed.keyMoments)
          ? parsed.keyMoments.slice(0, 3)
          : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements.slice(0, 3)
          : [],
        detectedWeakness: parsed.detectedWeakness?.trim() || "",
        recommendedSkill: skill,
        suggestedWorkout,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const { gameName = "Fortnite" } = req.body as { gameName?: string };
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({
          available: false,
          error:
            "Servizio Gaming News non disponibile: chiave API Gemini non configurata per la ricerca online.",
        });
        return;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Cerca le notizie ufficiali, patch note ed eventi più recenti per il videogioco "${gameName}" (anno 2025/2026). Scrivi un riassunto chiaro e fedele in italiano diviso in 3 punti con data precisa per ciascuna novità trovata. Se non trovi notizie verificate recenti, dichiaralo chiaramente senza inventare.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const summary = response.text?.trim() || "";
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

      const sources = chunks
        .map((c) => {
          const web = (c as { web?: { uri?: string; title?: string } }).web;
          if (!web?.uri) return null;
          return {
            title: web.title || web.uri,
            url: web.uri,
          };
        })
        .filter((item): item is { title: string; url: string } => item !== null)
        .slice(0, 6);

      if (!summary || sources.length === 0) {
        res.json({
          available: false,
          summary:
            summary ||
            `Nessuna fonte aggiornata verificata trovata al momento per ${gameName}.`,
          sources: [],
          fetchedAt: new Date().toLocaleString("it-IT"),
        });
        return;
      }

      res.json({
        available: true,
        summary,
        sources,
        fetchedAt: new Date().toLocaleString("it-IT"),
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({
        available: false,
        error: `Impossibile recuperare notizie aggiornate: ${formatted.message}`,
      });
    }
  });

  app.post("/api/tournaments/find", async (req, res) => {
    try {
      const {
        gameName = "Fortnite",
        mode = "Tutte",
        level = "Tutti",
        platform = "Tutte",
        locationType = "Online",
        localArea = "",
      } = req.body as {
        gameName?: string;
        mode?: string;
        level?: string;
        platform?: string;
        locationType?: string;
        localArea?: string;
      };

      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({
          available: false,
          tournaments: [],
          sources: [],
          message:
            "Ricerca tornei online non attiva: chiave API Gemini non configurata sul server.",
          lastUpdated: new Date().toLocaleString("it-IT"),
        });
        return;
      }

      const ai = getAiClient();
      const areaNote =
        locationType === "Locale" && localArea.trim()
          ? ` nella zona di "${localArea.trim()}"`
          : "";

      const searchPrompt = `Cerca tornei ufficiali e competizioni aperte o recenti/in arrivo per il videogioco "${gameName}" (anno 2025/2026) con questi filtri:
- Modalità: ${mode}
- Livello: ${level}
- Piattaforma: ${platform}
- Tipo: ${locationType}${areaNote}

Regole OBBLIGATORIE di correttezza:
1. Cerca SOLO su fonti attendibili e pagine ufficiali (es. siti ufficiali dei giochi, Epic Games Competitive, ESL Play, FACEIT, Battlefy, Start.gg, Toornament, Supercell, EA Sports FC Pro).
2. NON inventare mai tornei, date, orari, premi, numero partecipanti o link.
3. Segnala sempre eventuali limiti di età e requisiti di iscrizione.
4. Se non trovi tornei verificabili e aggiornati per questi filtri esatti, scrivilo chiaramente senza inventare nulla.`;

      const groundedResponse = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundedText = groundedResponse.text?.trim() || "";
      const chunks =
        groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

      const sources = chunks
        .map((c) => {
          const web = (c as { web?: { uri?: string; title?: string } }).web;
          if (!web?.uri) return null;
          return {
            title: web.title || web.uri,
            url: web.uri,
          };
        })
        .filter((item): item is { title: string; url: string } => item !== null)
        .slice(0, 8);

      const lastUpdated = new Date().toLocaleString("it-IT");

      if (!groundedText || sources.length === 0) {
        res.json({
          available: false,
          tournaments: [],
          sources: [],
          message:
            groundedText ||
            `Nessun torneo verificabile trovato al momento da fonti ufficiali per ${gameName} con questi filtri.`,
          lastUpdated,
        });
        return;
      }

      const sourcesListText = sources
        .map((s, idx) => `[${idx + 1}] ${s.title} -> ${s.url}`)
        .join("\n");

      const extractResponse = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Estrai in JSON SOLO i tornei reali e verificabili descritti nel testo seguente.
REGOLA ASSOLUTA:
- Non inventare alcun dato. Se un campo non è indicato nel testo, scrivi "Vedi pagina ufficiale".
- Per "officialUrl", puoi usare ESCLUSIVAMENTE uno degli URL presenti nella lista "Fonti verificate" qui sotto (quello più pertinente al torneo) oppure "" se nessun URL corrisponde.
- Se il testo afferma che non ci sono tornei verificabili, restituisci "tournaments": [].

Testo verificato:
${groundedText}

Fonti verificate:
${sourcesListText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryMessage: { type: Type.STRING },
              tournaments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    gameName: { type: Type.STRING },
                    dateTime: { type: Type.STRING },
                    mode: { type: Type.STRING },
                    participants: { type: Type.STRING },
                    level: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    locationType: { type: Type.STRING },
                    requirements: { type: Type.STRING },
                    ageLimit: { type: Type.STRING },
                    prizes: { type: Type.STRING },
                    rules: { type: Type.STRING },
                    status: { type: Type.STRING },
                    officialUrl: { type: Type.STRING },
                    sourceName: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((extractResponse.text ?? "{}").trim()) as {
        summaryMessage?: string;
        tournaments?: Array<{
          name?: string;
          gameName?: string;
          dateTime?: string;
          mode?: string;
          participants?: string;
          level?: string;
          platform?: string;
          locationType?: string;
          requirements?: string;
          ageLimit?: string;
          prizes?: string;
          rules?: string;
          status?: string;
          officialUrl?: string;
          sourceName?: string;
        }>;
      };

      const validUrls = new Set(sources.map((s) => s.url));
      const cleanTournaments = (Array.isArray(parsed.tournaments) ? parsed.tournaments : [])
        .filter((t) => Boolean(t.name && t.name.trim()))
        .slice(0, 6)
        .map((t, idx) => {
          const rawUrl = (t.officialUrl || "").trim();
          const safeUrl = validUrls.has(rawUrl)
            ? rawUrl
            : sources[idx]?.url || sources[0]?.url || "";
          const rawStatus = (t.status || "").toLowerCase();
          let status: "Iscrizioni aperte" | "In corso" | "Concluso" | "Verifica sulla fonte" =
            "Verifica sulla fonte";
          if (rawStatus.includes("apert")) status = "Iscrizioni aperte";
          else if (rawStatus.includes("corso") || rawStatus.includes("live")) status = "In corso";
          else if (rawStatus.includes("conclus") || rawStatus.includes("terminat")) status = "Concluso";

          return {
            id: `found-${Date.now()}-${idx}`,
            name: t.name!.trim(),
            gameName: t.gameName?.trim() || gameName,
            dateTime: t.dateTime?.trim() || "Vedi pagina ufficiale",
            mode: t.mode?.trim() || mode,
            participants: t.participants?.trim() || "Vedi pagina ufficiale",
            level: t.level?.trim() || level,
            platform: t.platform?.trim() || platform,
            locationType: t.locationType?.trim() || locationType,
            requirements: t.requirements?.trim() || "Vedi pagina ufficiale",
            ageLimit: t.ageLimit?.trim() || "Verifica limite d'età sul regolamento ufficiale",
            prizes: t.prizes?.trim() || "Vedi pagina ufficiale",
            rules: t.rules?.trim() || "Consulta il regolamento sulla pagina ufficiale",
            status,
            officialUrl: safeUrl,
            sourceName: t.sourceName?.trim() || sources[idx]?.title || "Fonte ufficiale",
            lastUpdated,
          };
        });

      res.json({
        available: cleanTournaments.length > 0,
        tournaments: cleanTournaments,
        sources,
        message:
          parsed.summaryMessage?.trim() ||
          (cleanTournaments.length > 0
            ? `Trovati ${cleanTournaments.length} tornei da fonti verificabili.`
            : `Nessun torneo verificabile corrisponde esattamente ai filtri scelti per ${gameName}.`),
        lastUpdated,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({
        available: false,
        tournaments: [],
        sources: [],
        message: `Impossibile cercare tornei aggiornati: ${formatted.message}`,
        lastUpdated: new Date().toLocaleString("it-IT"),
      });
    }
  });

  app.post("/api/coach/speak", async (req, res) => {
    try {
      const { text } = req.body as { text?: string };
      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Testo mancante per la lettura vocale." });
        return;
      }

      const cleanText = text
        .replace(/[*_`#]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 750);

      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: "Amichevole, chiaro, energico coach di gaming italiano",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Charon" },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("Audio vocale non disponibile al momento.");
      }

      res.json({ audioBase64: base64Audio, mimeType: "audio/wav" });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post("/api/coach/workout", async (req, res) => {
    try {
      const {
        gameName = "Fortnite",
        playerLevel = "Principiante",
        focusArea = "Mira",
        difficulty = "Facile",
        durationMinutes = 10,
      } = req.body as {
        gameName?: string;
        playerLevel?: string;
        focusArea?: string;
        difficulty?: string;
        durationMinutes?: number;
      };

      const safeMinutes = Math.max(5, Math.min(20, Number(durationMinutes) || 10));
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Crea un allenamento pratico per ${gameName}, livello giocatore ${playerLevel}, difficoltà missione "${difficulty}", focalizzato su "${focusArea}", della durata totale di circa ${safeMinutes} minuti. Dividilo in 3 o 4 passi molto chiari.`,
        config: {
          systemInstruction:
            "Sei un coach di gaming esperto di didattica. Scrivi in italiano semplice, pratico e motivante.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              skillCategory: {
                type: Type.STRING,
                description:
                  "Una sola tra: mira, riflessi, movimento, costruzione, strategia, precisione, tattica, decisioni",
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    seconds: { type: Type.INTEGER },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim()) as {
        title?: string;
        description?: string;
        skillCategory?: string;
        steps?: Array<{ title?: string; instruction?: string; seconds?: number }>;
      };

      const steps =
        Array.isArray(parsed.steps) && parsed.steps.length > 0
          ? parsed.steps.slice(0, 4).map((s, idx) => ({
              id: `step-${Date.now()}-${idx}`,
              title: s.title || `Passo ${idx + 1}`,
              instruction:
                s.instruction || "Esegui l'esercizio con calma concentrandoti sul controllo.",
              seconds: Math.max(45, Math.min(360, Number(s.seconds) || 120)),
            }))
          : [
              {
                id: `step-${Date.now()}-0`,
                title: "Riscaldamento mirato",
                instruction: `Entra in modalità pratica su ${gameName} e muoviti con fluidità per prendere ritmo.`,
                seconds: 120,
              },
              {
                id: `step-${Date.now()}-1`,
                title: "Esercizio principale",
                instruction: `Concentrati su ${focusArea} ripetendo il gesto con precisione prima di aumentare la velocità.`,
                seconds: 180,
              },
              {
                id: `step-${Date.now()}-2`,
                title: "Applicazione in partita",
                instruction: "Metti subito alla prova la tecnica in una partita reale.",
                seconds: 180,
              },
            ];

      res.json({
        workout: {
          id: `custom-${Date.now()}`,
          title: parsed.title || `Allenamento ${focusArea}`,
          description:
            parsed.description ||
            `Sessione su misura per migliorare in ${gameName}.`,
          durationMinutes: safeMinutes,
          xpReward: safeMinutes * 6,
          skillCategory: normalizeSkill(parsed.skillCategory),
          missionTier:
            difficulty === "Difficile" || difficulty === "Media"
              ? difficulty
              : "Facile",
          isCustom: true,
          steps,
        },
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post("/api/community/moderate", async (req, res) => {
    try {
      const {
        title = "",
        body = "",
        mediaBase64 = "",
        mimeType = "",
      } = req.body as {
        title?: string;
        body?: string;
        mediaBase64?: string;
        mimeType?: string;
      };

      const combinedText = `${title}\n${body}`.trim();
      if (!combinedText) {
        res.status(400).json({
          approved: false,
          reason: "Inserisci un testo prima di pubblicare.",
        });
        return;
      }

      // 1. Controlli deterministici immediati (privacy minori, link/spam, numeri di telefono, indirizzi)
      const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
      const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
      const urlRegex = /(https?:\/\/|www\.|\.com\/|\.it\/|t\.me\/|wa\.me\/|discord\.gg)/i;
      const addressRegex =
        /\b(via|viale|piazza|corso)\s+[a-zàèéìòù]{3,}\s+\d{1,4}\b/i;

      if (phoneRegex.test(combinedText) || emailRegex.test(combinedText) || addressRegex.test(combinedText)) {
        res.json({
          approved: false,
          reason:
            "Per la sicurezza dei giovani è vietato pubblicare numeri di telefono, email o indirizzi reali.",
          method: "Filtro Sicurezza Automatico",
        });
        return;
      }

      if (urlRegex.test(combinedText)) {
        res.json({
          approved: false,
          reason:
            "Link esterni o inviti non verificati sono bloccati per evitare spam e rischi di sicurezza.",
          method: "Filtro Anti-Spam",
        });
        return;
      }

      const supportedImages = ["image/png", "image/jpeg", "image/webp"];
      const supportedVideos = ["video/mp4", "video/webm"];

      if (mediaBase64) {
        if (![...supportedImages, ...supportedVideos].includes(mimeType)) {
          res.status(400).json({
            approved: false,
            reason:
              "Formato file non supportato. Sono consentiti solo PNG, JPG, WEBP, MP4 e WEBM.",
          });
          return;
        }
        if (mediaBase64.length > 22 * 1024 * 1024) {
          res.status(400).json({
            approved: false,
            reason:
              "Il file supera il limite di 15 MB e non può essere moderato automaticamente.",
          });
          return;
        }
      }

      // 2. Moderazione multimodale reale tramite Gemini AI (NSFW, testo offuscato, bullismo, violenza grafica, dati personali)
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({
          approved: false,
          reason:
            "La moderazione AI non è attiva (GEMINI_API_KEY mancante). La pubblicazione resta bloccata finché il controllo automatico non è disponibile.",
        });
        return;
      }

      const ai = getAiClient();
      const parts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (mediaBase64 && mimeType) {
        parts.push({
          inlineData: {
            mimeType,
            data: mediaBase64,
          },
        });
      }

      parts.push({
        text: `Sei il moderatore di sicurezza di GAMECOACH COMMUNITY, una community gaming adatta anche a minorenni.
Analizza attentamente questo contenuto (testo e eventuale immagine/video allegata) prima della pubblicazione.

Testo da verificare:
Titolo: "${title}"
Contenuto: "${body}"

Devi BLOCCARE (approved: false) se rilevi anche uno solo di questi elementi, inclusi testi camuffati con numeri/simboli o testi dentro immagini/video:
1. Contenuti sessualmente espliciti, pornografici, nudità o allusioni sessuali.
2. Violenza grafica estrema, autolesionismo o immagini scioccanti.
3. Insulti, bullismo, odio, minacce, molestie o linguaggio tossico.
4. Spam, truffe o link sospetti.
5. Dati personali (numeri di telefono, indirizzi, scuole, posizione reale, nomi e cognomi reali o inviti a chat private esterne).

Se il contenuto è sano, legato ai videogiochi (strategie, epic fails divertenti, clip di gioco, vittorie, consigli) e sicuro per i minorenni, approva (approved: true).
Restituisci JSON con:
- "approved": boolean
- "reason": spiegazione chiara e gentile in italiano se bloccato (altrimenti "Contenuto verificato e sicuro").`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              approved: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim()) as {
        approved?: boolean;
        reason?: string;
      };

      const approved = parsed.approved === true;
      res.json({
        approved,
        reason:
          parsed.reason?.trim() ||
          (approved
            ? "Contenuto verificato dai filtri di sicurezza AI."
            : "Contenuto non idoneo alle linee guida della community."),
        method: "Moderazione AI Gemini + Filtri Sicurezza",
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({
        approved: false,
        reason: `Verifica di sicurezza non riuscita: ${formatted.message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*path}", (_req, res) => {
      const indexHtml = path.join(distDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send("Build non trovata.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GAMECOACH AI server attivo su http://localhost:${PORT}`);
  });
}

startServer();
