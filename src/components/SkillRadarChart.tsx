import React from "react";
import type { PlayerProgress } from "../types";

interface SkillRadarChartProps {
  progress: PlayerProgress;
  teamActive: boolean;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  progress,
  teamActive,
}) => {
  // 7 assi richiesti, tutti calcolati esclusivamente da dati reali registrati
  const axes = [
    { label: "Mira", value: Math.min(100, progress.skills.mira || 0) },
    { label: "Riflessi", value: Math.min(100, progress.skills.riflessi || 0) },
    { label: "Strategia", value: Math.min(100, progress.skills.strategia || 0) },
    { label: "Movimento", value: Math.min(100, progress.skills.movimento || 0) },
    { label: "Precisione", value: Math.min(100, progress.skills.precisione || 0) },
    { label: "Decisioni", value: Math.min(100, progress.skills.decisioni || 0) },
    {
      label: "Collaborazione",
      value: Math.min(
        100,
        (progress.skills.tattica || 0) + (teamActive ? 10 : 0)
      ),
    },
  ];

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 98;
  const levels = [25, 50, 75, 100];

  const getPoint = (index: number, val: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const dataPolygon = axes
    .map((a, idx) => {
      const pt = getPoint(idx, Math.max(4, a.value));
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Skill Radar</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Punteggi calcolati solo dai tuoi allenamenti completati e attività reali (0–100)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 flex justify-center">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[290px] h-auto"
            role="img"
            aria-label="Grafico radar delle 7 abilità reali del giocatore"
          >
            {/* Griglia esagonale/ettagonale */}
            {levels.map((lvl) => {
              const pts = axes
                .map((_, i) => {
                  const p = getPoint(i, lvl);
                  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  key={lvl}
                  points={pts}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Assi */}
            {axes.map((a, i) => {
              const edge = getPoint(i, 100);
              const labelPos = getPoint(i, 124);
              return (
                <g key={a.label}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={edge.x}
                    y2={edge.y}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#CBD5E1"
                    fontSize="10.5"
                    fontWeight="700"
                  >
                    {a.label}
                  </text>
                </g>
              );
            })}

            {/* Area dati reali */}
            <polygon
              points={dataPolygon}
              fill="rgba(59, 130, 246, 0.28)"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {axes.map((a, i) => {
              const pt = getPoint(i, Math.max(4, a.value));
              return (
                <circle
                  key={a.label}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#60A5FA"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        <div className="md:col-span-6 space-y-2.5">
          {axes.map((a) => (
            <div key={a.label} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{a.label}</span>
                <span className="font-mono tabular-nums text-blue-400">
                  {a.value}/100
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 transition-all"
                  style={{ width: `${a.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
