import React from "react";
import {
  BarChart3,
  Dumbbell,
  Gamepad2,
  Globe,
  Home,
  MessageSquare,
  Swords,
  Trophy,
  User,
} from "lucide-react";
import type { NavTab } from "../types";

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeGameName: string;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string; mobileLabel: string }> = [
  { id: "home", label: "Home", mobileLabel: "Home" },
  { id: "coach", label: "Coach AI", mobileLabel: "Coach" },
  { id: "workouts", label: "Allenamento", mobileLabel: "Allena" },
  { id: "arcade", label: "Arcade", mobileLabel: "Arcade" },
  { id: "tournaments", label: "Tornei", mobileLabel: "Tornei" },
  { id: "community", label: "Community", mobileLabel: "Social" },
  { id: "stats", label: "Statistiche", mobileLabel: "Stats" },
  { id: "profile", label: "Profilo", mobileLabel: "Profilo" },
  { id: "trophies", label: "Trofei", mobileLabel: "Trofei" },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  activeGameName,
}) => {
  const renderMobileIcon = (id: NavTab, isActive: boolean) => {
    const cls = `w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`;
    switch (id) {
      case "home":
        return <Home className={cls} />;
      case "coach":
        return <MessageSquare className={cls} />;
      case "workouts":
        return <Dumbbell className={cls} />;
      case "arcade":
        return <Gamepad2 className={cls} />;
      case "tournaments":
        return <Swords className={cls} />;
      case "community":
        return <Globe className={cls} />;
      case "stats":
        return <BarChart3 className={cls} />;
      case "profile":
        return <User className={cls} />;
      case "trophies":
        return <Trophy className={cls} />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070B14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 lg:gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onSelectTab("home")}
            className="text-left font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded-lg"
          >
            GAMECOACH <span className="text-blue-400">AI</span>
          </button>

          <nav
            aria-label="Navigazione principale"
            className="hidden md:flex items-center gap-2.5 lg:gap-4 overflow-x-auto"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`min-h-[44px] px-1 text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 border-b-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    isActive
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            {activeTab === "coach" ? (
              <button
                type="button"
                onClick={() => onSelectTab("workouts")}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-xs lg:text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer transition-all duration-150"
              >
                Allena · {activeGameName}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab("coach")}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-xs lg:text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer transition-all duration-150"
              >
                Parla con il Coach
              </button>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Navigazione mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0B101D]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center overflow-x-auto gap-0.5 px-1 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center min-h-[46px] min-w-[66px] flex-1 shrink-0 cursor-pointer transition-colors"
              >
                {renderMobileIcon(item.id, isActive)}
                <span
                  className={`mt-0.5 text-[10px] font-semibold whitespace-nowrap ${
                    isActive ? "text-blue-400" : "text-slate-400"
                  }`}
                >
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

