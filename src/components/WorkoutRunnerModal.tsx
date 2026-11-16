import React, { useEffect, useState } from "react";
import { CheckCircle2, Pause, Play, RotateCcw, ArrowRight, X } from "lucide-react";
import type { Workout } from "../types";
import { SKILL_LABELS } from "../data/games";

interface WorkoutRunnerModalProps {
  workout: Workout;
  gameName: string;
  onClose: () => void;
  onComplete: (workout: Workout) => void;
}

export const WorkoutRunnerModal: React.FC<WorkoutRunnerModalProps> = ({
  workout,
  gameName,
  onClose,
  onComplete,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = workout.steps[stepIndex];
  const [secondsLeft, setSecondsLeft] = useState(currentStep.seconds);
  const [isRunning, setIsRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setSecondsLeft(workout.steps[stepIndex].seconds);
  }, [stepIndex, workout]);

  useEffect(() => {
    if (!isRunning || finished) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, finished]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleNextStep = () => {
    if (stepIndex < workout.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setIsRunning(true);
    } else {
      setFinished(true);
      setIsRunning(false);
    }
  };

  const handleConfirmFinish = () => {
    onComplete(workout);
    onClose();
  };

  const progressPercent = Math.round(
    ((stepIndex + (finished ? 1 : 0)) / workout.steps.length) * 100
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="runner-title"
    >
      <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#0F172A] border border-white/15 p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <p className="text-sm font-medium text-blue-400">
              {gameName} · {SKILL_LABELS[workout.skillCategory]}
            </p>
            <h2
              id="runner-title"
              className="mt-1 text-2xl sm:text-3xl font-bold text-white"
            >
              {workout.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi allenamento"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>
              Passo <span className="tabular-nums font-semibold text-white">{Math.min(stepIndex + 1, workout.steps.length)}</span> di{" "}
              <span className="tabular-nums">{workout.steps.length}</span>
            </span>
            <span className="tabular-nums font-mono text-violet-300">
              +{workout.xpReward} XP alla fine
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {!finished ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl bg-[#162038] border border-white/10 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-violet-300">
                    Esercizio attuale
                  </p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                    {currentStep.title}
                  </h3>
                </div>
                <div className="self-start sm:self-center rounded-2xl bg-[#0B101D] border border-blue-500/30 px-5 py-3">
                  <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-blue-400">
                    {formatTime(secondsLeft)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-200">
                {currentStep.instruction}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning((r) => !r)}
                  className="min-h-[52px] flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base px-5 cursor-pointer transition-colors"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pausa timer
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Riprendi timer
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSecondsLeft(currentStep.seconds)}
                  className="min-h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-base px-5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Ricomincia
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full min-h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-lg px-6 cursor-pointer transition-all"
            >
              {stepIndex < workout.steps.length - 1 ? (
                <>
                  Passo completato · Avanti
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Completa ultimo passo
                  <CheckCircle2 className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-[#162038] border border-emerald-500/30 p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
              Allenamento completato!
            </h3>
            <p className="mt-2 text-base text-slate-300">
              Ottimo lavoro. Hai guadagnato{" "}
              <span className="font-mono font-bold text-violet-300 tabular-nums">
                +{workout.xpReward} XP
              </span>{" "}
              e migliorato{" "}
              <span className="font-semibold text-blue-300">
                {SKILL_LABELS[workout.skillCategory]}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={handleConfirmFinish}
              className="mt-6 w-full min-h-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg px-6 cursor-pointer transition-colors"
            >
              Salva i tuoi progressi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
