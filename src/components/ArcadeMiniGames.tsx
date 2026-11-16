import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { InstantPlayId } from "../types";

type GamePhase = "TITLE_MENU" | "PLAYING" | "GAME_OVER";

function playTone(enabled: boolean, freq: number, duration = 0.07) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => void ctx.close(), 180);
  } catch {
    // Ignore audio context restriction
  }
}

/* 1. REFLEX AIM GRID (HTML5 Canvas) */
const AimGridGame: React.FC<{ soundOn: boolean }> = ({ soundOn }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<GamePhase>("TITLE_MENU");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [avgReactionMs, setAvgReactionMs] = useState<number | null>(null);

  const targetRef = useRef({ x: 180, y: 140, r: 24, spawnedAt: Date.now() });
  const reactionsRef = useRef<number[]>([]);

  const spawnTarget = useCallback(() => {
    const padding = 34;
    const w = 520;
    const h = 320;
    const x = padding + Math.random() * (w - padding * 2);
    const y = padding + Math.random() * (h - padding * 2);
    targetRef.current = { x, y, r: 22, spawnedAt: Date.now() };
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#080E1C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tactical grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (phase === "PLAYING") {
      const t = targetRef.current;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fillStyle = "#2563EB";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#93C5FD";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
  }, [phase]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, score, misses]);

  useEffect(() => {
    if (phase !== "PLAYING") return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase("GAME_OVER");
          playTone(soundOn, 320, 0.16);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, soundOn]);

  const startGame = () => {
    setScore(0);
    setMisses(0);
    setTimeLeft(30);
    setAvgReactionMs(null);
    reactionsRef.current = [];
    spawnTarget();
    setPhase("PLAYING");
    playTone(soundOn, 520, 0.08);
  };

  const handlePointer = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== "PLAYING") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const t = targetRef.current;
    const dist = Math.hypot(px - t.x, py - t.y);

    if (dist <= t.r + 4) {
      const reaction = Date.now() - t.spawnedAt;
      reactionsRef.current.push(reaction);
      const avg = Math.round(
        reactionsRef.current.reduce((a, b) => a + b, 0) /
          reactionsRef.current.length
      );
      setAvgReactionMs(avg);
      setScore((s) => s + 1);
      spawnTarget();
      playTone(soundOn, 680, 0.05);
    } else {
      setMisses((m) => m + 1);
      playTone(soundOn, 210, 0.06);
    }
    drawCanvas();
  };

  const accuracy =
    score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 text-sm font-mono tabular-nums">
        <span className="text-blue-300 font-bold">Centri: {score}</span>
        <span className="text-slate-300">Precisione: {accuracy}%</span>
        <span className="text-violet-300">
          Reazione: {avgReactionMs !== null ? `${avgReactionMs} ms` : "—"}
        </span>
        <span className="text-amber-300 font-bold">Tempo: {timeLeft}s</span>
      </div>

      {phase === "TITLE_MENU" && (
        <div className="rounded-2xl bg-[#080E1C] border border-white/10 p-8 text-center space-y-4">
          <h3 className="text-2xl font-extrabold text-white">Reflex Aim Grid</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Tocca o clicca i bersagli blu il più velocemente possibile per 30 secondi.
            Nessun download richiesto: allena precisione e tempi di reazione nel browser.
          </p>
          <button
            type="button"
            onClick={startGame}
            className="min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Inizia Partita
          </button>
        </div>
      )}

      {phase === "PLAYING" && (
        <canvas
          ref={canvasRef}
          width={520}
          height={320}
          onClick={handlePointer}
          className="w-full h-auto rounded-2xl border border-blue-500/30 cursor-crosshair touch-manipulation"
        />
      )}

      {phase === "GAME_OVER" && (
        <div className="rounded-2xl bg-[#080E1C] border border-emerald-500/35 p-8 text-center space-y-4">
          <h3 className="text-2xl font-extrabold text-white">Sessione Completata</h3>
          <p className="font-mono text-base text-slate-200 tabular-nums">
            Bersagli: {score} · Precisione: {accuracy}% · Media:{" "}
            {avgReactionMs ?? "—"} ms
          </p>
          <button
            type="button"
            onClick={startGame}
            className="min-h-[48px] px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Gioca Ancora
          </button>
        </div>
      )}
    </div>
  );
};

/* 2. NEON SNAKE CLASSIC (HTML5 Canvas + Touch D-pad) */
const SnakeGame: React.FC<{ soundOn: boolean }> = ({ soundOn }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<GamePhase>("TITLE_MENU");
  const [score, setScore] = useState(0);

  const gridSize = 18;
  const cellPx = 18;
  const snakeRef = useRef<Array<{ x: number; y: number }>>([{ x: 9, y: 9 }]);
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const nextDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number }>({ x: 13, y: 9 });

  const spawnFood = useCallback((snake: Array<{ x: number; y: number }>) => {
    let pos = { x: 4, y: 4 };
    for (let i = 0; i < 40; i++) {
      const fx = Math.floor(Math.random() * gridSize);
      const fy = Math.floor(Math.random() * gridSize);
      if (!snake.some((s) => s.x === fx && s.y === fy)) {
        pos = { x: fx, y: fy };
        break;
      }
    }
    foodRef.current = pos;
  }, []);

  const startGame = () => {
    const init = [
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ];
    snakeRef.current = init;
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    spawnFood(init);
    setScore(0);
    setPhase("PLAYING");
    playTone(soundOn, 480, 0.08);
  };

  const setDirection = useCallback((dx: number, dy: number) => {
    const cur = dirRef.current;
    if (cur.x + dx === 0 && cur.y + dy === 0) return;
    nextDirRef.current = { x: dx, y: dy };
  }, []);

  useEffect(() => {
    if (phase !== "PLAYING") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        setDirection(0, -1);
      } else if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        setDirection(0, 1);
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        setDirection(-1, 0);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        setDirection(1, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, setDirection]);

  useEffect(() => {
    if (phase !== "PLAYING") return;

    const tick = window.setInterval(() => {
      const snake = [...snakeRef.current];
      const dir = nextDirRef.current;
      dirRef.current = dir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize ||
        snake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        setPhase("GAME_OVER");
        playTone(soundOn, 180, 0.18);
        return;
      }

      snake.unshift(head);
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((s) => s + 10);
        spawnFood(snake);
        playTone(soundOn, 640, 0.06);
      } else {
        snake.pop();
      }
      snakeRef.current = snake;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#080E1C";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Food
          ctx.fillStyle = "#A855F7";
          ctx.fillRect(
            foodRef.current.x * cellPx + 2,
            foodRef.current.y * cellPx + 2,
            cellPx - 4,
            cellPx - 4
          );

          // Snake
          snake.forEach((seg, idx) => {
            ctx.fillStyle = idx === 0 ? "#60A5FA" : "#2563EB";
            ctx.fillRect(
              seg.x * cellPx + 1,
              seg.y * cellPx + 1,
              cellPx - 2,
              cellPx - 2
            );
          });
        }
      }
    }, 135);

    return () => window.clearInterval(tick);
  }, [phase, soundOn, spawnFood]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 text-sm font-mono tabular-nums">
        <span className="text-blue-300 font-bold">Punteggio: {score}</span>
        <span className="text-slate-400">Frecce / WASD o pulsanti touch</span>
      </div>

      {phase === "TITLE_MENU" && (
        <div className="rounded-2xl bg-[#080E1C] border border-white/10 p-8 text-center space-y-4">
          <h3 className="text-2xl font-extrabold text-white">Neon Snake Classic</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Raccogli i nuclei viola evitando i bordi e la tua coda. Giocabile con
            tastiera o comandi direzionali touch.
          </p>
          <button
            type="button"
            onClick={startGame}
            className="min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Inizia Partita
          </button>
        </div>
      )}

      {phase === "PLAYING" && (
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={gridSize * cellPx}
            height={gridSize * cellPx}
            className="rounded-2xl border border-blue-500/30 bg-[#080E1C]"
          />
          <div className="grid grid-cols-3 gap-2 w-44">
            <div />
            <button
              type="button"
              aria-label="Su"
              onClick={() => setDirection(0, -1)}
              className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />
            <button
              type="button"
              aria-label="Sinistra"
              onClick={() => setDirection(-1, 0)}
              className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Giù"
              onClick={() => setDirection(0, 1)}
              className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Destra"
              onClick={() => setDirection(1, 0)}
              className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {phase === "GAME_OVER" && (
        <div className="rounded-2xl bg-[#080E1C] border border-rose-500/35 p-8 text-center space-y-4">
          <h3 className="text-2xl font-extrabold text-white">Partita Terminata</h3>
          <p className="font-mono text-base text-slate-200 tabular-nums">
            Punteggio finale: {score}
          </p>
          <button
            type="button"
            onClick={startGame}
            className="min-h-[48px] px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Gioca Ancora
          </button>
        </div>
      )}
    </div>
  );
};

/* 3. 2048 ARCADE */
function slideRow(row: number[]): { next: number[]; gained: number } {
  const nonZero = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < nonZero.length; i++) {
    if (nonZero[i] === nonZero[i + 1]) {
      const val = nonZero[i] * 2;
      merged.push(val);
      gained += val;
      i++;
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < 4) merged.push(0);
  return { next: merged, gained };
}

function addRandomTile(board: number[][]): number[][] {
  const empty: Array<[number, number]> = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return board;
  const [rr, cc] = empty[Math.floor(Math.random() * empty.length)];
  const copy = board.map((row) => [...row]);
  copy[rr][cc] = Math.random() < 0.9 ? 2 : 4;
  return copy;
}

function canMoveBoard(b: number[][]): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (b[r][c] === 0) return true;
      if (r < 3 && b[r][c] === b[r + 1][c]) return true;
      if (c < 3 && b[r][c] === b[r][c + 1]) return true;
    }
  }
  return false;
}

const Game2048: React.FC<{ soundOn: boolean }> = ({ soundOn }) => {
  const makeInitial = () =>
    addRandomTile(
      addRandomTile([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ])
    );

  const [board, setBoard] = useState<number[][]>(makeInitial);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const move = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver) return;
      let totalGain = 0;
      const working = board.map((r) => [...r]);

      const applyHorizontal = (reverse: boolean) =>
        working.map((row) => {
          const seq = reverse ? [...row].reverse() : row;
          const { next, gained } = slideRow(seq);
          totalGain += gained;
          return reverse ? next.reverse() : next;
        });

      const transpose = (m: number[][]) =>
        m[0].map((_, c) => m.map((r) => r[c]));

      let result: number[][];
      if (dir === "left") result = applyHorizontal(false);
      else if (dir === "right") result = applyHorizontal(true);
      else {
        const trans = transpose(working);
        const slid = trans.map((row) => {
          const seq = dir === "down" ? [...row].reverse() : row;
          const { next, gained } = slideRow(seq);
          totalGain += gained;
          return dir === "down" ? next.reverse() : next;
        });
        result = transpose(slid);
      }

      const changed = JSON.stringify(result) !== JSON.stringify(board);
      if (!changed) return;

      const withTile = addRandomTile(result);
      setBoard(withTile);
      setScore((s) => s + totalGain);
      playTone(soundOn, totalGain > 0 ? 600 : 420, 0.05);
      if (!canMoveBoard(withTile)) {
        setGameOver(true);
      }
    },
    [board, gameOver, soundOn]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move("right");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        move("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        move("down");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const reset = () => {
    setBoard(makeInitial());
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 text-sm font-mono tabular-nums">
        <span className="text-blue-300 font-bold">Punteggio: {score}</span>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-sans font-bold text-white cursor-pointer"
        >
          Nuova Partita
        </button>
      </div>

      <div className="mx-auto max-w-[320px] grid grid-cols-4 gap-2 rounded-2xl bg-[#080E1C] border border-white/10 p-3">
        {board.flat().map((val, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-xl flex items-center justify-center font-mono text-lg font-extrabold tabular-nums ${
              val === 0
                ? "bg-[#141E34] text-transparent"
                : val >= 128
                  ? "bg-violet-600 text-white"
                  : val >= 16
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-white"
            }`}
          >
            {val || "."}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2 w-44">
          <div />
          <button
            type="button"
            aria-label="Sposta su"
            onClick={() => move("up")}
            className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Sposta a sinistra"
            onClick={() => move("left")}
            className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Sposta giù"
            onClick={() => move("down")}
            className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Sposta a destra"
            onClick={() => move("right")}
            className="min-h-[44px] rounded-xl bg-[#141E34] border border-white/15 flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {gameOver && (
        <div className="rounded-xl bg-amber-950/50 border border-amber-500/40 p-3 text-center text-sm font-bold text-amber-200">
          Nessuna mossa disponibile! Punteggio finale: {score}
        </div>
      )}
    </div>
  );
};

/* 4. CYBER MEMORY MATCH */
const MEMORY_SYMBOLS = ["AK", "XP", "GG", "HP", "MP", "CD", "TP", "ULT"];

const MemoryMatchGame: React.FC<{ soundOn: boolean }> = ({ soundOn }) => {
  const buildDeck = () =>
    [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((label, idx) => ({ id: idx, label, matched: false }));

  const [cards, setCards] = useState(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2) return;
    if (flipped.includes(idx) || cards[idx].matched) return;

    playTone(soundOn, 500, 0.04);
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped;
      if (cards[a].label === cards[b].label) {
        setCards((prev) =>
          prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        );
        setFlipped([]);
        playTone(soundOn, 740, 0.09);
      } else {
        setTimeout(() => setFlipped([]), 650);
      }
    }
  };

  const allMatched = cards.every((c) => c.matched);

  const reset = () => {
    setCards(buildDeck());
    setFlipped([]);
    setMoves(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-[#141E34] border border-white/10 px-4 py-3 text-sm font-mono tabular-nums">
        <span className="text-blue-300 font-bold">Mosse: {moves}</span>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-sans font-bold text-white cursor-pointer"
        >
          Mescola
        </button>
      </div>

      <div className="mx-auto max-w-[340px] grid grid-cols-4 gap-2.5">
        {cards.map((card, idx) => {
          const shown = card.matched || flipped.includes(idx);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(idx)}
              className={`aspect-square rounded-xl font-mono text-base font-extrabold cursor-pointer transition-all ${
                card.matched
                  ? "bg-emerald-600/30 border border-emerald-400/50 text-emerald-200"
                  : shown
                    ? "bg-blue-600 text-white"
                    : "bg-[#141E34] border border-white/15 text-slate-500 hover:border-blue-400"
              }`}
            >
              {shown ? card.label : "?"}
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/40 p-3 text-center text-sm font-bold text-emerald-200">
          Tutte le coppie completate in {moves} mosse!
        </div>
      )}
    </div>
  );
};

interface ArcadeGamePlayerModalProps {
  gameId: InstantPlayId | null;
  title: string;
  onClose: () => void;
}

export const ArcadeGamePlayerModal: React.FC<ArcadeGamePlayerModalProps> = ({
  gameId,
  title,
  onClose,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  if (!gameId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-[#0F172A] border border-white/15 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-400">
              Mini-Gioco Browser Integrato · Avvio Immediato
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundOn((v) => !v)}
              aria-label={soundOn ? "Disattiva audio" : "Attiva audio"}
              className="min-h-[42px] min-w-[42px] rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi gioco"
              className="min-h-[42px] min-w-[42px] rounded-xl bg-white/10 hover:bg-rose-600/30 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {gameId === "aim" && <AimGridGame soundOn={soundOn} />}
        {gameId === "snake" && <SnakeGame soundOn={soundOn} />}
        {gameId === "2048" && <Game2048 soundOn={soundOn} />}
        {gameId === "memory" && <MemoryMatchGame soundOn={soundOn} />}
      </div>
    </div>
  );
};
