import type {
  DailyGoal,
  GameId,
  GameInfo,
  GamerProfile,
  PlayerProgress,
  ProgramDayItem,
  SkillKey,
  WeeklyChallenge,
  Workout,
} from "../types";

export const SKILL_LABELS: Record<SkillKey, string> = {
  mira: "Mira",
  riflessi: "Riflessi",
  movimento: "Movimento",
  costruzione: "Costruzione",
  strategia: "Strategia",
  precisione: "Precisione",
  tattica: "Tattica",
  decisioni: "Decisioni",
};

export const ALL_SKILL_KEYS: SkillKey[] = [
  "mira",
  "riflessi",
  "movimento",
  "costruzione",
  "strategia",
  "precisione",
  "tattica",
  "decisioni",
];

export const GAMES: GameInfo[] = [
  {
    id: "fortnite",
    name: "Fortnite",
    genre: "Battle Royale",
    shortTip: "Proteggiti con un muro prima di rispondere al fuoco.",
    description:
      "Allena mira, costruzione veloce, modifica rapida e gestione delle zone finali.",
    keySkills: ["mira", "costruzione", "decisioni"],
    starterQuestions: [
      "Come imposto una sensibilità facile per iniziare?",
      "Cosa devo fare nei primi 60 secondi dopo l'atterraggio?",
      "Come costruisco un riparo veloce quando mi sparano?",
    ],
  },
  {
    id: "cod",
    name: "Call of Duty",
    genre: "Sparatutto FPS",
    shortTip: "Tieni il mirino all'altezza del petto prima di girare ogni angolo.",
    description:
      "Migliora riflessi, controllo del rinculo, lettura della minimappa e tattica.",
    keySkills: ["mira", "riflessi", "tattica"],
    starterQuestions: [
      "Come riduco il rinculo delle armi automatiche?",
      "Come evito di farmi sorprendere alle spalle?",
      "Quando conviene spingere e quando difendere?",
    ],
  },
  {
    id: "brawlstars",
    name: "Brawl Stars",
    genre: "Arena 3v3",
    shortTip: "Tieni sempre una munizione di riserva invece di sparare tutto insieme.",
    description:
      "Padroneggia la schivata dei colpi, il controllo delle corsie e l'uso della Super.",
    keySkills: ["movimento", "tattica", "decisioni"],
    starterQuestions: [
      "Come schivo meglio i colpi degli avversari?",
      "Quando è il momento giusto per usare la Super?",
      "Come si tengono le corsie in 3v3?",
    ],
  },
  {
    id: "freefire",
    name: "Free Fire",
    genre: "Survival Royale",
    shortTip: "Piazza subito una parete Gloo appena subisci il primo colpo.",
    description:
      "Perfeziona il movimento rapido, i ripari istantanei e la precisione verso la testa.",
    keySkills: ["mira", "riflessi", "precisione"],
    starterQuestions: [
      "Come piazzo le pareti Gloo più velocemente?",
      "Come miglioro la precisione verso la testa?",
      "Dove conviene atterrare per giocare più tranquillo?",
    ],
  },
  {
    id: "minecraft",
    name: "Minecraft",
    genre: "Sopravvivenza e Costruzione",
    shortTip: "Tieni sempre spada, blocchi, torce e cibo negli stessi slot rapidi.",
    description:
      "Organizza la sopravvivenza, migliora nei duelli PvP e costruisci strutture sicure.",
    keySkills: ["costruzione", "strategia", "movimento"],
    starterQuestions: [
      "Come organizzo la barra rapida per non confondermi?",
      "Come miglioro nei duelli PvP con spada e scudo?",
      "Come costruisco basi e ponti in sicurezza?",
    ],
  },
  {
    id: "roblox",
    name: "Roblox",
    genre: "Multigioco e Obby",
    shortTip: "Inclina la telecamera dall'alto nei salti stretti per vedere l'atterraggio.",
    description:
      "Allena precisione nei salti, riflessi veloci e decisioni nei minigiochi.",
    keySkills: ["movimento", "precisione", "riflessi"],
    starterQuestions: [
      "Come supero gli Obby difficili senza cadere?",
      "Come gestisco meglio la visuale in corsa?",
      "Come reagisco più velocemente nei minigiochi?",
    ],
  },
  {
    id: "rocketleague",
    name: "Rocket League",
    genre: "Auto-Calcio",
    shortTip: "Se un compagno è già sulla palla, resta indietro a coprire la porta.",
    description:
      "Impara tiri puliti, parate sicure, controllo del turbo e rotazioni di squadra.",
    keySkills: ["precisione", "movimento", "tattica"],
    starterQuestions: [
      "Quando devo togliere o lasciare la visuale sulla palla?",
      "Come faccio rotazioni ordinate senza lasciare la porta vuota?",
      "Come colpisco la palla con più precisione?",
    ],
  },
  {
    id: "eafc",
    name: "EA Sports FC",
    genre: "Calcio Simulativo",
    shortTip: "In difesa usa il contenimento invece di andare sempre subito in scivolata.",
    description:
      "Affina passaggi sicuri, scelte tattiche, copertura difensiva e finalizzazione.",
    keySkills: ["tattica", "precisione", "decisioni"],
    starterQuestions: [
      "Come difendo senza farmi saltare facilmente?",
      "Qual è il tiro migliore davanti al portiere?",
      "Come costruisco l'azione senza perdere palla?",
    ],
  },
  {
    id: "pubgmobile",
    name: "PUBG Mobile",
    genre: "Battle Royale Tattico",
    shortTip: "Usa i ripari naturali e controlla i suoni prima di attraversare spazi aperti.",
    description:
      "Allena mira a media distanza, controllo del rinculo, audio tattico e rotazioni zona.",
    keySkills: ["mira", "strategia", "precisione"],
    starterQuestions: [
      "Come controllo meglio il mirino 3x e 4x?",
      "Come mi muovo verso la zona sicura senza espormi?",
      "Quali accessori delle armi conviene tenere?",
    ],
  },
  {
    id: "altri",
    name: "Altri giochi",
    genre: "Titolo Personalizzato",
    shortTip: "Concentrati su un solo errore per volta in ogni partita.",
    description:
      "Imposta qualsiasi altro gioco nel tuo profilo (es. Valorant, Apex, Clash Royale) e ricevi coaching dedicato.",
    keySkills: ["strategia", "decisioni", "riflessi"],
    starterQuestions: [
      "Quali sono i fondamentali per migliorare velocemente nel mio gioco?",
      "Come capisco quali errori mi fanno perdere più spesso?",
      "Puoi crearmi un riscaldamento di 5 minuti adatto al mio gioco?",
    ],
  },
];

export const INITIAL_WORKOUTS: Workout[] = [
  // Riscaldamenti e giornalieri universali/specifici + missioni facili/medie/difficili
  {
    id: "fn-warmup",
    gameId: "fortnite",
    title: "Riscaldamento Pre-Partita Fortnite",
    description: "5 minuti per scaldare mira, costruzione muro-scala e cambio arma.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "mira",
    isWarmup: true,
    steps: [
      {
        id: "fn-w1",
        title: "Tracciamento lento",
        instruction: "Segui un bersaglio in movimento col mirino senza sparare per 60 secondi.",
        seconds: 90,
      },
      {
        id: "fn-w2",
        title: "Muro e scala rapidi",
        instruction: "Piazza 10 coppie muro + scala di seguito senza fretta ma con pulizia.",
        seconds: 120,
      },
      {
        id: "fn-w3",
        title: "Pompa + Mitraglietta",
        instruction: "Spara un colpo di pompa e cambia subito arma sul bersaglio.",
        seconds: 90,
      },
    ],
  },
  {
    id: "fn-daily",
    gameId: "fortnite",
    title: "Allenamento Giornaliero: Copertura e Colpo",
    description: "Spara dal lato destro della copertura e proteggiti dopo ogni scambio.",
    durationMinutes: 8,
    difficulty: "Principiante",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "costruzione",
    isDaily: true,
    steps: [
      {
        id: "fn-d1",
        title: "Sbirciata destra sicura",
        instruction: "Posizionati dietro un muro e affacciati solo dal lato destro per sparare.",
        seconds: 150,
      },
      {
        id: "fn-d2",
        title: "Modifica finestra e ripristino",
        instruction: "Apri una piccola finestra sul tuo muro, spara 1 colpo e richiudi subito.",
        seconds: 180,
      },
      {
        id: "fn-d3",
        title: "Scelta di rotazione",
        instruction: "Raggiungi il bordo alto della zona sicura evitando il centro affollato.",
        seconds: 150,
      },
    ],
  },
  {
    id: "fn-hard",
    gameId: "fortnite",
    title: "Sfida Decisioni Endgame",
    description: "Gestisci materiali, cure e posizionamento negli ultimi 10 giocatori.",
    durationMinutes: 12,
    difficulty: "Avanzato",
    missionTier: "Difficile",
    xpReward: 85,
    skillCategory: "decisioni",
    steps: [
      {
        id: "fn-h1",
        title: "Risparmio materiali",
        instruction: "Spostati usando coperture naturali prima di consumare legno e metallo.",
        seconds: 240,
      },
      {
        id: "fn-h2",
        title: "Terza parte intelligente",
        instruction: "Attacca solo quando due avversari hanno già sprecato scudi tra loro.",
        seconds: 240,
      },
      {
        id: "fn-h3",
        title: "Chiusura in altezza",
        instruction: "Conquista un piano sopra gli avversari e chiudi il duello con calma.",
        seconds: 240,
      },
    ],
  },

  // Call of Duty
  {
    id: "cod-warmup",
    gameId: "cod",
    title: "Riscaldamento Riflessi Call of Duty",
    description: "Prepara polso/pollice e allinea il mirino prima di entrare in classifica.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "riflessi",
    isWarmup: true,
    steps: [
      {
        id: "cod-w1",
        title: "Altezza petto costante",
        instruction: "Muoviti in mappa privata tenendo il mirino sempre all'altezza del busto.",
        seconds: 120,
      },
      {
        id: "cod-w2",
        title: "Aggancio bersagli",
        instruction: "Passa con il mirino da un bersaglio fermo all'altro fermandoti esattamente sul centro.",
        seconds: 180,
      },
    ],
  },
  {
    id: "cod-daily",
    gameId: "cod",
    title: "Controllo Rinculo e Pre-Mira",
    description: "Mantieni le raffiche dritte e anticipa l'uscita dei nemici dagli angoli.",
    durationMinutes: 8,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "precisione",
    isDaily: true,
    steps: [
      {
        id: "cod-d1",
        title: "Test al muro",
        instruction: "Spara un caricatore compensando leggermente verso il basso per raggruppare i colpi.",
        seconds: 150,
      },
      {
        id: "cod-d2",
        title: "Controllo porte e corridoi",
        instruction: "Entra in mira un istante prima di superare ogni spigolo pericoloso.",
        seconds: 180,
      },
      {
        id: "cod-d3",
        title: "Lettura minimappa",
        instruction: "Controlla i punti rossi e la posizione dei compagni dopo ogni scontro.",
        seconds: 150,
      },
    ],
  },

  // Brawl Stars
  {
    id: "bs-warmup",
    gameId: "brawlstars",
    title: "Riscaldamento Schivata Brawl Stars",
    description: "Sciogli il pollice sul movimento laterale e prepara la mira manuale.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "movimento",
    isWarmup: true,
    steps: [
      {
        id: "bs-w1",
        title: "Passo a zig-zag",
        instruction: "Avvicinati ai bot cambiando lato ogni secondo per schivare i colpi dritti.",
        seconds: 150,
      },
      {
        id: "bs-w2",
        title: "Mira anticipata",
        instruction: "Trascina il colpo leggermente davanti alla direzione del bersaglio.",
        seconds: 150,
      },
    ],
  },
  {
    id: "bs-daily",
    gameId: "brawlstars",
    title: "Tattica Corsie 3v3",
    description: "Gestisci le 3 munizioni e difendi il vantaggio della squadra.",
    durationMinutes: 8,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "tattica",
    isDaily: true,
    steps: [
      {
        id: "bs-d1",
        title: "Regola dell'ultimo colpo",
        instruction: "Non scaricare tutte e 3 le barre insieme: tienine sempre 1 carica di sicurezza.",
        seconds: 180,
      },
      {
        id: "bs-d2",
        title: "Controllo cespugli",
        instruction: "Spara un colpo di verifica in ogni cespuglio prima di attraversarlo.",
        seconds: 150,
      },
      {
        id: "bs-d3",
        title: "Ritirata intelligente",
        instruction: "Quando hai molte gemme o stelle, arretra verso la tua metà campo.",
        seconds: 150,
      },
    ],
  },

  // Free Fire
  {
    id: "ff-warmup",
    gameId: "freefire",
    title: "Riscaldamento Parete Gloo e Mira",
    description: "5 minuti in addestramento per mettere muro e mirare verso la testa.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "riflessi",
    isWarmup: true,
    steps: [
      {
        id: "ff-w1",
        title: "Sparo e Gloo rapido",
        instruction: "Spara 3 colpi al manichino e piazza subito una parete Gloo davanti a te.",
        seconds: 150,
      },
      {
        id: "ff-w2",
        title: "Trascinamento morbido",
        instruction: "Parti dal petto e fai salire il pollice con fluidità verso la testa.",
        seconds: 150,
      },
    ],
  },
  {
    id: "ff-daily",
    gameId: "freefire",
    title: "Sopravvivenza e Ripari Free Fire",
    description: "Scegli i combattimenti favorevoli e cura sempre dietro copertura.",
    durationMinutes: 8,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "decisioni",
    isDaily: true,
    steps: [
      {
        id: "ff-d1",
        title: "Zaino ordinato",
        instruction: "Elimina munizioni inutili per avere sempre spazio per kit medici e Gloo.",
        seconds: 150,
      },
      {
        id: "ff-d2",
        title: "Spostamenti coperti",
        instruction: "Muoviti sempre da un albero o edificio all'altro evitando campi scoperti.",
        seconds: 180,
      },
      {
        id: "ff-d3",
        title: "Cambio lato dopo il muro",
        instruction: "Dopo aver messo una parete Gloo, esci dal lato opposto a quello atteso dal nemico.",
        seconds: 150,
      },
    ],
  },

  // Minecraft
  {
    id: "mc-warmup",
    gameId: "minecraft",
    title: "Riscaldamento Barra Rapida & Scudo",
    description: "Allenati a cambiare subito tra spada, scudo e blocchi.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "movimento",
    isWarmup: true,
    steps: [
      {
        id: "mc-w1",
        title: "Cambio slot rapido",
        instruction: "Passa 15 volte tra Spada (1), Piccone (2) e Blocchi (3) senza guardare la tastiera.",
        seconds: 150,
      },
      {
        id: "mc-w2",
        title: "Blocca e colpisci",
        instruction: "Para con lo scudo, salta e sferra il colpo critico mentre scendi.",
        seconds: 150,
      },
    ],
  },
  {
    id: "mc-daily",
    gameId: "minecraft",
    title: "Costruzione Sicura e Strategia",
    description: "Piazza ponti veloci e organizza difese anti-mob senza rischi.",
    durationMinutes: 9,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "costruzione",
    isDaily: true,
    steps: [
      {
        id: "mc-d1",
        title: "Ponte accovacciato veloce",
        instruction: "Costruisci un ponte di 20 blocchi tenendo l'abbassamento attivo sul bordo.",
        seconds: 180,
      },
      {
        id: "mc-d2",
        title: "Illuminazione sicura",
        instruction: "Piazza torce ogni 6-7 blocchi nelle grotte per evitare spawn alle spalle.",
        seconds: 180,
      },
      {
        id: "mc-d3",
        title: "Secchio d'acqua salvavita",
        instruction: "Allenati a piazzare acqua sotto i piedi da piccola altezza per attutire cadute.",
        seconds: 180,
      },
    ],
  },

  // Roblox
  {
    id: "rb-warmup",
    gameId: "roblox",
    title: "Riscaldamento Salti Precisione",
    description: "5 minuti per calibrare telecamera e tempismo nei salti.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "precisione",
    isWarmup: true,
    steps: [
      {
        id: "rb-w1",
        title: "Visuale dall'alto",
        instruction: "Orienta la camera verso il basso per vedere esattamente il bordo di ogni pedana.",
        seconds: 150,
      },
      {
        id: "rb-w2",
        title: "Salto su blocchi piccoli",
        instruction: "Supera una serie di 10 blocchi stretti fermandoti un attimo su ognuno.",
        seconds: 150,
      },
    ],
  },
  {
    id: "rb-daily",
    gameId: "roblox",
    title: "Riflessi e Decisioni Multigioco",
    description: "Leggi subito gli obiettivi del round e reagisci agli ostacoli.",
    durationMinutes: 7,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 50,
    skillCategory: "riflessi",
    isDaily: true,
    steps: [
      {
        id: "rb-d1",
        title: "Lettura primi 5 secondi",
        instruction: "All'avvio del minigioco osserva subito trappole, uscite e posizione compagni.",
        seconds: 140,
      },
      {
        id: "rb-d2",
        title: "Rotazione camera in corsa",
        instruction: "Gira la visuale mentre corri senza interrompere il movimento.",
        seconds: 140,
      },
      {
        id: "rb-d3",
        title: "Scelta corsia libera",
        instruction: "Evita la calca centrale e cerca percorsi laterali più puliti.",
        seconds: 140,
      },
    ],
  },

  // Rocket League
  {
    id: "rl-warmup",
    gameId: "rocketleague",
    title: "Riscaldamento Palla Libera",
    description: "5 minuti in Allenamento Libero per prendere confidenza con i colpi.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "precisione",
    isWarmup: true,
    steps: [
      {
        id: "rl-w1",
        title: "Guida fluida con Ball Cam",
        instruction: "Colpisci la palla contro il muro e seguine il rimbalzo mantenendo la Ball Cam attiva.",
        seconds: 150,
      },
      {
        id: "rl-w2",
        title: "Tiri dritti in porta",
        instruction: "Centra la porta da metà campo con un salto + capriola in avanti.",
        seconds: 150,
      },
    ],
  },
  {
    id: "rl-daily",
    gameId: "rocketleague",
    title: "Rotazione e Copertura Porta",
    description: "Evita di inseguire la palla coi compagni e difendi il secondo palo.",
    durationMinutes: 8,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "tattica",
    isDaily: true,
    steps: [
      {
        id: "rl-d1",
        title: "Rientro sul palo lontano",
        instruction: "Torna verso la tua porta passando dal lato opposto alla palla.",
        seconds: 160,
      },
      {
        id: "rl-d2",
        title: "Raccolta pad piccoli",
        instruction: "Mantieni il turbo sopra 40 usando i punti luminosi centrali.",
        seconds: 160,
      },
      {
        id: "rl-d3",
        title: "Rinvii verso gli angoli",
        instruction: "Spingi sempre i palloni pericolosi verso le fasce laterali.",
        seconds: 160,
      },
    ],
  },

  // EA Sports FC
  {
    id: "fc-warmup",
    gameId: "eafc",
    title: "Riscaldamento Passaggi & Tiro",
    description: "5 minuti nell'arena prove per calibrare passaggi e tiri a giro.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "precisione",
    isWarmup: true,
    steps: [
      {
        id: "fc-w1",
        title: "Tiri sul palo lontano",
        instruction: "Entra in area lateralmente e piazza 8 tiri di precisione sul palo opposto.",
        seconds: 150,
      },
      {
        id: "fc-w2",
        title: "Passaggio e scatto",
        instruction: "Allenati a passare di prima verso il compagno libero senza correre subito.",
        seconds: 150,
      },
    ],
  },
  {
    id: "fc-daily",
    gameId: "eafc",
    title: "Difesa Ordinata e Decisioni",
    description: "Chiudi le linee di passaggio e non far uscire i difensori centrali.",
    durationMinutes: 8,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 55,
    skillCategory: "decisioni",
    isDaily: true,
    steps: [
      {
        id: "fc-d1",
        title: "Contenimento paziente",
        instruction: "Accompagna l'attaccante tenendo premuto il contenimento senza scivolate rischiose.",
        seconds: 160,
      },
      {
        id: "fc-d2",
        title: "Rientro coi centrocampisti",
        instruction: "Controlla i mediani per chiudere i passaggi al centro.",
        seconds: 160,
      },
      {
        id: "fc-d3",
        title: "Scelta del passaggio sicuro",
        instruction: "Quando recuperi palla, gioca semplice sul compagno più vicino libero.",
        seconds: 160,
      },
    ],
  },

  // PUBG Mobile
  {
    id: "pubg-warmup",
    gameId: "pubgmobile",
    title: "Riscaldamento Campo Addestramento PUBG",
    description: "5 minuti per controllare il rinculo dei mirini e il cambio rapido posizione.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "mira",
    isWarmup: true,
    steps: [
      {
        id: "pubg-w1",
        title: "Controllo mirino Red Dot e 3x",
        instruction: "Spara raffiche da 10 colpi sui bersagli a 50 metri abbassando dolcemente la mira.",
        seconds: 150,
      },
      {
        id: "pubg-w2",
        title: "Inclinazione dietro albero",
        instruction: "Allenati a sporgerti a destra e sinistra con i tasti sbirciata prima di sparare.",
        seconds: 150,
      },
    ],
  },
  {
    id: "pubg-daily",
    gameId: "pubgmobile",
    title: "Strategia Zona e Audio Passi",
    description: "Anticipa i cerchi e sfrutta i rilievi del terreno per sopravvivere fino alla fine.",
    durationMinutes: 9,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 60,
    skillCategory: "strategia",
    isDaily: true,
    steps: [
      {
        id: "pubg-d1",
        title: "Rotazione con 1 minuto di anticipo",
        instruction: "Spostati verso la nuova zona sicura prima che parta il restringimento.",
        seconds: 180,
      },
      {
        id: "pubg-d2",
        title: "Fumogeni sempre nello zaino",
        instruction: "Porta 3 granate fumogene per creare copertura quando devi attraversare spazi aperti.",
        seconds: 180,
      },
      {
        id: "pubg-d3",
        title: "Controllo creste e rocce",
        instruction: "Fermati sempre dietro dossi o rocce evitando di restare esposto sul punto più alto.",
        seconds: 180,
      },
    ],
  },

  // Altri giochi
  {
    id: "altri-warmup",
    gameId: "altri",
    title: "Riscaldamento Universale 5 Minuti",
    description: "Adatto a qualsiasi titolo: attiva attenzione, tempi di reazione e controllo.",
    durationMinutes: 5,
    difficulty: "Principiante",
    missionTier: "Facile",
    xpReward: 35,
    skillCategory: "riflessi",
    isWarmup: true,
    steps: [
      {
        id: "alt-w1",
        title: "Pratica comandi base",
        instruction: "Entra in modalità libera/pratica ed esegui per 2 minuti i 3 movimenti principali del tuo gioco.",
        seconds: 150,
      },
      {
        id: "alt-w2",
        title: "Precisione lenta",
        instruction: "Ripeti l'azione principale lentamente puntando alla massima precisione prima della velocità.",
        seconds: 150,
      },
    ],
  },
  {
    id: "altri-daily",
    gameId: "altri",
    title: "Sessione Tattica & Decisioni",
    description: "Individua un errore ricorrente e correggilo in 2 partite concentrate.",
    durationMinutes: 10,
    difficulty: "Intermedio",
    missionTier: "Media",
    xpReward: 60,
    skillCategory: "decisioni",
    isDaily: true,
    steps: [
      {
        id: "alt-d1",
        title: "Scegli un solo obiettivo",
        instruction: "Decidi prima di iniziare quale errore evitare in questa partita (es. troppa fretta).",
        seconds: 180,
      },
      {
        id: "alt-d2",
        title: "Pausa di 10 secondi dopo ogni sconfitta",
        instruction: "Chiediti cosa potevi fare diversamente prima di premere subito Gioca di nuovo.",
        seconds: 240,
      },
      {
        id: "alt-d3",
        title: "Annota nel diario partite",
        instruction: "Registra il risultato nella sezione Statistiche per parlarne con Coach Marco.",
        seconds: 180,
      },
    ],
  },
];

export const PROGRAM_7_DAYS: ProgramDayItem[] = [
  {
    day: 1,
    title: "Controllo e Sensibilità",
    focusSkill: "precisione",
    instruction: "Imposta comandi e sensibilità comodi ed esegui 5 minuti di movimento lento e preciso.",
    durationMinutes: 5,
    xpReward: 40,
  },
  {
    day: 2,
    title: "Mira e Posizionamento Mirino",
    focusSkill: "mira",
    instruction: "Tieni sempre il mirino o la visuale pronta dove può arrivare l'azione.",
    durationMinutes: 7,
    xpReward: 45,
  },
  {
    day: 3,
    title: "Movimento e Copertura",
    focusSkill: "movimento",
    instruction: "Allenati a usare ripari naturali o costruzioni prima di rispondere agli attacchi.",
    durationMinutes: 8,
    xpReward: 50,
  },
  {
    day: 4,
    title: "Riflessi sotto Pressione",
    focusSkill: "riflessi",
    instruction: "Esercita reazioni pulite ai segnali visivi e sonori senza farti prendere dal panico.",
    durationMinutes: 8,
    xpReward: 50,
  },
  {
    day: 5,
    title: "Lettura della Mappa e Tattica",
    focusSkill: "tattica",
    instruction: "Controlla minimappa o posizione compagni ogni pochi secondi per anticipare le giocate.",
    durationMinutes: 9,
    xpReward: 55,
  },
  {
    day: 6,
    title: "Decisioni nei Momenti Chiave",
    focusSkill: "decisioni",
    instruction: "Impara quando attaccare e quando ritirarti per salvare risorse o vantaggio.",
    durationMinutes: 10,
    xpReward: 60,
  },
  {
    day: 7,
    title: "Verifica Completa con Coach Marco",
    focusSkill: "strategia",
    instruction: "Gioca 2 partite concentrato, registra i risultati nel diario e analizzali col Coach.",
    durationMinutes: 12,
    xpReward: 80,
  },
];

export const PROGRAM_30_DAYS: ProgramDayItem[] = Array.from({ length: 30 }, (_, idx) => {
  const day = idx + 1;
  const skill = ALL_SKILL_KEYS[idx % ALL_SKILL_KEYS.length];
  const week = Math.floor(idx / 7) + 1;
  const phaseNames = [
    "Settimana 1 · Fondamentali",
    "Settimana 2 · Controllo e Ritmo",
    "Settimana 3 · Tattica e Pressione",
    "Settimana 4 · Maestria e Costanza",
    "Sprint Finale",
  ];
  return {
    day,
    title: `Giorno ${day} · ${SKILL_LABELS[skill]}`,
    focusSkill: skill,
    instruction: `${phaseNames[week - 1] ?? "Consolidamento"}: dedica ${
      6 + (day % 5)
    } minuti a esercizi mirati su ${SKILL_LABELS[skill].toLowerCase()} nel tuo gioco attivo.`,
    durationMinutes: 6 + (day % 5),
    xpReward: 40 + week * 10,
  };
});

export const DEFAULT_DAILY_GOALS: DailyGoal[] = [
  {
    id: "goal-warmup",
    title: "Completa il riscaldamento pre-partita",
    subtitle: "5 minuti prima della prima partita per attivare riflessi e precisione",
    xpReward: 25,
    completed: false,
    type: "warmup",
  },
  {
    id: "goal-workout",
    title: "Completa 1 missione o allenamento guidato",
    subtitle: "Scegli un esercizio dalla sezione Allenamento e portalo a termine",
    xpReward: 50,
    completed: false,
    type: "workout",
  },
  {
    id: "goal-coach",
    title: "Confrontati con Coach Marco",
    subtitle: "Chiedi un consiglio o racconta come è andata una partita",
    xpReward: 30,
    completed: false,
    type: "coach",
  },
  {
    id: "goal-match",
    title: "Registra 1 partita nel diario",
    subtitle: "Annota risultato ed errore principale nella sezione Statistiche",
    xpReward: 35,
    completed: false,
    type: "match",
  },
];

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "wk-workouts",
    title: "Costanza d'Acciaio",
    description: "Completa 5 allenamenti guidati questa settimana",
    target: 5,
    xpReward: 120,
    metric: "workouts",
  },
  {
    id: "wk-matches",
    title: "Diario del Campione",
    description: "Registra 4 partite reali nel tuo diario",
    target: 4,
    xpReward: 100,
    metric: "matches",
  },
  {
    id: "wk-coach",
    title: "Dialogo col Coach",
    description: "Invia 5 messaggi o analisi al tuo Coach AI",
    target: 5,
    xpReward: 90,
    metric: "coach",
  },
  {
    id: "wk-minutes",
    title: "Mezz'Ora di Pratica",
    description: "Accumula almeno 30 minuti reali di allenamento",
    target: 30,
    xpReward: 140,
    metric: "minutes",
  },
];

export interface TrophyDefinition {
  id: string;
  title: string;
  description: string;
  rewardLabel: string;
  check: (p: PlayerProgress, goalsCompletedCount: number) => {
    unlocked: boolean;
    current: number;
    target: number;
  };
}

export const TROPHIES: TrophyDefinition[] = [
  {
    id: "tr-first-workout",
    title: "Primo Passo in Arena",
    description: "Completa il tuo primo allenamento guidato.",
    rewardLabel: "Badge Principiante Attivo",
    check: (p) => ({
      unlocked: p.completedWorkoutsCount >= 1,
      current: Math.min(1, p.completedWorkoutsCount),
      target: 1,
    }),
  },
  {
    id: "tr-coach-talk",
    title: "Voce in Campo",
    description: "Parla o scrivi almeno 3 volte a Coach Marco.",
    rewardLabel: "Badge Sintonia Coach",
    check: (p) => ({
      unlocked: p.coachMessagesCount >= 3,
      current: Math.min(3, p.coachMessagesCount),
      target: 3,
    }),
  },
  {
    id: "tr-diary",
    title: "Analista delle Partite",
    description: "Registra almeno 3 partite nel Diario delle Partite.",
    rewardLabel: "Trofeo Consapevolezza",
    check: (p) => ({
      unlocked: p.matchDiary.length >= 3,
      current: Math.min(3, p.matchDiary.length),
      target: 3,
    }),
  },
  {
    id: "tr-media",
    title: "Occhio Tattico",
    description: "Analizza almeno 1 screenshot o clip di partita con l'AI.",
    rewardLabel: "Badge Revisione Video",
    check: (p) => ({
      unlocked: p.mediaAnalysesCount >= 1,
      current: Math.min(1, p.mediaAnalysesCount),
      target: 1,
    }),
  },
  {
    id: "tr-streak-3",
    title: "Serie di 3 Giorni",
    description: "Allenati per 3 giorni consecutivi.",
    rewardLabel: "Trofeo Costanza",
    check: (p) => ({
      unlocked: p.streakDays >= 3,
      current: Math.min(3, p.streakDays),
      target: 3,
    }),
  },
  {
    id: "tr-program-7",
    title: "Settimana Perfetta",
    description: "Completa tutti i 7 giorni del Programma 7 Giorni.",
    rewardLabel: "Trofeo Disciplina 7G",
    check: (p) => ({
      unlocked: p.completedProgram7Days.length >= 7,
      current: Math.min(7, p.completedProgram7Days.length),
      target: 7,
    }),
  },
  {
    id: "tr-xp-500",
    title: "Quota 500 XP",
    description: "Raggiungi 500 punti esperienza reali con allenamenti e sfide.",
    rewardLabel: "Badge Veterano",
    check: (p) => ({
      unlocked: p.xp >= 500,
      current: Math.min(500, p.xp),
      target: 500,
    }),
  },
  {
    id: "tr-daily-sweep",
    title: "Giornata Completa",
    description: "Completa tutti e 4 gli obiettivi giornalieri nello stesso giorno.",
    rewardLabel: "Trofeo Stella del Giorno",
    check: (_p, goalsCount) => ({
      unlocked: goalsCount >= 4,
      current: Math.min(4, goalsCount),
      target: 4,
    }),
  },
];

export const COACH_PERSONALITIES: Array<{
  id: "motivatore" | "stratega" | "severo" | "amichevole";
  label: string;
  description: string;
}> = [
  {
    id: "motivatore",
    label: "Motivatore",
    description: "Energico e positivo, trasforma ogni sconfitta in carica.",
  },
  {
    id: "stratega",
    label: "Stratega",
    description: "Analitico, ragiona su mappa, tempi e decisioni tattiche.",
  },
  {
    id: "severo",
    label: "Severo ma rispettoso",
    description: "Diretto sugli errori, disciplinato ma sempre educato.",
  },
  {
    id: "amichevole",
    label: "Amichevole",
    description: "Calmo, paziente e semplice per chi parte da zero.",
  },
];

export const SHOP_ITEMS: Array<{
  id: string;
  name: string;
  description: string;
  category: "avatar" | "cornice" | "sfondo" | "badge";
  rarity: "Comune" | "Raro" | "Epico" | "Leggendario";
  costXp: number;
  previewClass: string;
  avatarId?: "visor" | "cyber" | "tactical" | "striker" | "builder" | "champion";
}> = [
  {
    id: "frame-blue",
    name: "Cornice Blu Elettrico",
    description: "Bordo luminoso blu intorno al tuo profilo giocatore.",
    category: "cornice",
    rarity: "Comune",
    costXp: 50,
    previewClass: "ring-2 ring-blue-500",
  },
  {
    id: "bg-midnight",
    name: "Sfondo Arena Notturna",
    description: "Gradiente blu notte e viola profondo per la scheda profilo.",
    category: "sfondo",
    rarity: "Comune",
    costXp: 70,
    previewClass: "bg-gradient-to-br from-blue-950 via-[#0F172A] to-violet-950",
  },
  {
    id: "badge-focus",
    name: "Badge Concentrazione",
    description: "Distintivo dedicato a chi completa gli allenamenti senza fretta.",
    category: "badge",
    rarity: "Raro",
    costXp: 100,
    previewClass: "text-blue-400",
  },
  {
    id: "frame-violet",
    name: "Cornice Viola Plasma",
    description: "Effetto cornice viola intenso per veri tattici.",
    category: "cornice",
    rarity: "Raro",
    costXp: 140,
    previewClass: "ring-2 ring-violet-500 shadow-lg shadow-violet-600/30",
  },
  {
    id: "avatar-striker",
    name: "Avatar Attaccante",
    description: "Sblocca l'emblema speciale Attaccante per il tuo profilo.",
    category: "avatar",
    rarity: "Epico",
    costXp: 180,
    previewClass: "from-blue-500 to-emerald-600",
    avatarId: "striker",
  },
  {
    id: "bg-esports",
    name: "Sfondo Palco eSports",
    description: "Sfondo luminoso blu elettrico e viola da torneo.",
    category: "sfondo",
    rarity: "Epico",
    costXp: 220,
    previewClass: "bg-gradient-to-r from-blue-900/60 via-[#141E34] to-violet-900/60",
  },
  {
    id: "badge-legend",
    name: "Badge Maestro Costanza",
    description: "Mostra a tutta la community la tua dedizione quotidiana.",
    category: "badge",
    rarity: "Leggendario",
    costXp: 350,
    previewClass: "text-amber-400",
  },
  {
    id: "frame-legend",
    name: "Cornice Leggendaria Oro-Viola",
    description: "La cornice più rara del Negozio XP, solo con vero allenamento.",
    category: "cornice",
    rarity: "Leggendario",
    costXp: 450,
    previewClass: "ring-2 ring-amber-400 shadow-lg shadow-violet-500/40",
  },
];

export const INITIAL_TOURNAMENTS = [
  {
    id: "tour-daily-aim",
    title: "Sfida Precisione del Giorno",
    cadence: "Giornaliero" as const,
    format: "Individuale" as const,
    gameId: "fortnite" as const,
    description:
      "Iscriviti e registra oggi almeno 1 partita reale o allenamento di mira per segnare il tuo punteggio.",
    prizeLabel: "Trofeo Sfida Giornaliera + 60 XP",
    prizeXp: 60,
    joined: false,
    recordedScore: null,
    recordedMatches: 0,
  },
  {
    id: "tour-weekly-squad",
    title: "Coppa Tattica Settimanale",
    cadence: "Settimanale" as const,
    format: "A Squadre" as const,
    gameId: "brawlstars" as const,
    description:
      "Competizione settimanale a squadre: coordina i ruoli e registra i risultati delle vostre partite.",
    prizeLabel: "Badge Coppa Squadre + 120 XP",
    prizeXp: 120,
    joined: false,
    recordedScore: null,
    recordedMatches: 0,
  },
  {
    id: "tour-weekly-solo",
    title: "Torneo Costanza Multi-Gioco",
    cadence: "Settimanale" as const,
    format: "Individuale" as const,
    gameId: "cod" as const,
    description:
      "Sfida individuale aperta a tutti i titoli supportati: accumula punti reali con partite registrate e allenamenti.",
    prizeLabel: "Trofeo Costanza Arena + 150 XP",
    prizeXp: 150,
    joined: false,
    recordedScore: null,
    recordedMatches: 0,
  },
];

export const SECRET_MISSIONS = [
  {
    id: "sec-deep-coach",
    title: "Dialogo Profondo",
    hint: "Invia almeno 5 messaggi reali a Coach Marco analizzando i tuoi errori.",
    rewardXp: 75,
    badgeName: "Allievo Attento",
    metric: "coach_deep" as const,
    target: 5,
  },
  {
    id: "sec-replay-detective",
    title: "Occhio da Analista",
    hint: "Carica almeno 2 screenshot o clip nel Replay Lab per ricevere analisi reali.",
    rewardXp: 90,
    badgeName: "Analista Replay",
    metric: "replay_lab" as const,
    target: 2,
  },
  {
    id: "sec-team-spirit",
    title: "Spirito di Squadra",
    hint: "Crea una squadra gaming nella sezione Community -> Squadre.",
    rewardXp: 60,
    badgeName: "Capitano Arena",
    metric: "team_player" as const,
    target: 1,
  },
  {
    id: "sec-zero-hero",
    title: "Missione Lampo: Doppio Allenamento",
    hint: "Completa almeno 3 allenamenti guidati reali (missione a tempo settimanale).",
    rewardXp: 110,
    badgeName: "Velocista",
    isTimed: true,
    expiresLabel: "Sfida settimanale attiva",
    metric: "zero_to_hero" as const,
    target: 3,
  },
  {
    id: "sec-multi-game",
    title: "Esploratore Multi-Titolo",
    hint: "Allena almeno 2 giochi diversi tra i 10 titoli supportati.",
    rewardXp: 85,
    badgeName: "Versatile",
    metric: "multi_game" as const,
    target: 2,
  },
];

export const DEFAULT_ACCESSIBILITY = {
  textSize: "normale" as const,
  bigButtons: false,
  highContrast: false,
  colorMode: "default" as const,
  simplifiedUi: false,
  reduceMotion: false,
};

export const INITIAL_COMMUNITY_POSTS: never[] = [];

export const TOURNAMENT_MODES = ["Tutte", "Solo", "Duo", "Trio", "Squadra"] as const;
export const TOURNAMENT_PLATFORMS = [
  "Tutte",
  "PC",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Mobile",
] as const;
export const TOURNAMENT_LEVELS = [
  "Tutti",
  "Principiante",
  "Intermedio",
  "Avanzato",
] as const;

export const INITIAL_PROFILE: GamerProfile = {
  nickname: "Giocatore",
  bio: "Mi alleno ogni giorno su GAMECOACH AI per migliorare strategia, mira e decisioni.",
  avatarId: "visor",
  favoriteGameId: "fortnite",
  customGameTitle: "",
  level: "Principiante",
  coachPersonality: "motivatore",
  equippedFrameId: "",
  equippedBgId: "",
  equippedBadgeId: "",
  personalGoals: [
    {
      id: "pg-1",
      text: "Completare il riscaldamento prima delle partite",
      done: false,
    },
    {
      id: "pg-2",
      text: "Ridurre gli errori nei duelli ravvicinati",
      done: false,
    },
  ],
  weaknesses: [],
};

// Zero statistiche inventate: tutti i contatori partono da 0 e crescono solo con attività reali dell'utente.
export const INITIAL_PROGRESS: PlayerProgress = {
  xp: 0,
  spendableXp: 0,
  streakDays: 0,
  lastActiveDate: "",
  activeDates: [],
  totalMinutes: 0,
  completedWorkoutsCount: 0,
  coachMessagesCount: 0,
  mediaAnalysesCount: 0,
  skills: {
    mira: 0,
    riflessi: 0,
    movimento: 0,
    costruzione: 0,
    strategia: 0,
    precisione: 0,
    tattica: 0,
    decisioni: 0,
  },
  gameMinutes: {
    fortnite: 0,
    cod: 0,
    brawlstars: 0,
    freefire: 0,
    minecraft: 0,
    roblox: 0,
    rocketleague: 0,
    eafc: 0,
    pubgmobile: 0,
    altri: 0,
  },
  completedProgram7Days: [],
  completedProgram30Days: [],
  recentSessions: [],
  matchDiary: [],
  mediaAnalyses: [],
};

export function getDisplayGameName(
  gameId: GameId,
  customGameTitle?: string
): string {
  if (gameId === "altri" && customGameTitle?.trim()) {
    return customGameTitle.trim();
  }
  return GAMES.find((g) => g.id === gameId)?.name ?? "Fortnite";
}

export function getRankTitle(xp: number): string {
  if (xp >= 1500) return "Leggenda";
  if (xp >= 900) return "Pro Player";
  if (xp >= 500) return "Veterano";
  if (xp >= 250) return "Tattico";
  if (xp >= 100) return "Apprendista";
  return "Rookie";
}
