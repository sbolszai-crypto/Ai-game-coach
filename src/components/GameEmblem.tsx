import React from "react";
import {
  Crown,
  Flame,
  Gamepad2,
  Hammer,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import type { AvatarId, GameId } from "../types";

interface GameEmblemProps {
  gameId: GameId;
  className?: string;
}

export const GameEmblem: React.FC<GameEmblemProps> = ({
  gameId,
  className = "w-7 h-7",
}) => {
  switch (gameId) {
    case "fortnite":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M16 3L27 9.5V22.5L16 29L5 22.5V9.5L16 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 10H21V13.5H15.5V15.5H19.5V19H15.5V23H12V10Z"
            fill="currentColor"
          />
        </svg>
      );
    case "cod":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="currentColor" />
          <path
            d="M16 3V8M16 24V29M3 16H8M24 16H29"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "brawlstars":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M16 4L19.6 11.4L27.8 12.6L21.9 18.3L23.3 26.5L16 22.6L8.7 26.5L10.1 18.3L4.2 12.6L12.4 11.4L16 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16.5" r="3" fill="currentColor" />
        </svg>
      );
    case "freefire":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M17.5 4C17.5 9 23 11.5 23 18C23 23 19.5 27 15.5 27C11.5 27 8.5 23.5 8.5 19.2C8.5 15.5 10.8 13.1 12.2 11.5C12.5 14 14 15 15 15C13.8 11.5 14.8 7 17.5 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 23C17.2 23 18.5 21.6 18.5 19.8C18.5 18 16.5 16.6 15.5 15.8C14.5 16.6 12.5 18 12.5 19.8C12.5 21.6 13.8 23 15.5 23Z"
            fill="currentColor"
          />
        </svg>
      );
    case "minecraft":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect
            x="5"
            y="5"
            width="22"
            height="22"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect x="9" y="10" width="4" height="4" fill="currentColor" />
          <rect x="19" y="10" width="4" height="4" fill="currentColor" />
          <path d="M13 17H19V23H17V20H15V23H13V17Z" fill="currentColor" />
        </svg>
      );
    case "roblox":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M9.5 4.5L27.5 9.5L22.5 27.5L4.5 22.5L9.5 4.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x="13.5"
            y="13.5"
            width="5"
            height="5"
            transform="rotate(15 16 16)"
            fill="currentColor"
          />
        </svg>
      );
    case "rocketleague":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 19L9 12H21L26 17V21H6V19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="10.5" cy="22" r="2.8" fill="currentColor" />
          <circle cx="21.5" cy="22" r="2.8" fill="currentColor" />
          <path
            d="M12 12L14 8H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "eafc":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2" />
          <path
            d="M16 10L21 13.6L19.1 19.5H12.9L11 13.6L16 10Z"
            fill="currentColor"
          />
          <path
            d="M16 5V10M21 13.6L26 12M19.1 19.5L22.5 24.5M12.9 19.5L9.5 24.5M11 13.6L6 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "pubgmobile":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 15C7 9.5 11 6 16 6C21 6 25 9.5 25 15V22H7V15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x="9"
            y="14"
            width="14"
            height="5"
            rx="1.5"
            fill="currentColor"
          />
          <path
            d="M11 22V25H21V22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "altri":
      return <Gamepad2 className={className} aria-hidden="true" />;
  }
};

export const AVATAR_OPTIONS: Array<{
  id: AvatarId;
  label: string;
  gradient: string;
}> = [
  { id: "visor", label: "Visore Pro", gradient: "from-blue-600 to-violet-700" },
  { id: "cyber", label: "Scintilla", gradient: "from-cyan-500 to-blue-700" },
  { id: "tactical", label: "Cecchino", gradient: "from-violet-600 to-indigo-800" },
  { id: "striker", label: "Attaccante", gradient: "from-blue-500 to-emerald-600" },
  { id: "builder", label: "Architetto", gradient: "from-indigo-500 to-purple-700" },
  { id: "champion", label: "Campione", gradient: "from-violet-500 to-amber-500" },
];

export const GamerAvatarBadge: React.FC<{
  avatarId: AvatarId;
  sizeClass?: string;
}> = ({ avatarId, sizeClass = "h-14 w-14" }) => {
  const opt =
    AVATAR_OPTIONS.find((a) => a.id === avatarId) ?? AVATAR_OPTIONS[0];

  const renderIcon = () => {
    switch (avatarId) {
      case "visor":
        return <Shield className="w-7 h-7 text-white" />;
      case "cyber":
        return <Zap className="w-7 h-7 text-white" />;
      case "tactical":
        return <Target className="w-7 h-7 text-white" />;
      case "striker":
        return <Flame className="w-7 h-7 text-white" />;
      case "builder":
        return <Hammer className="w-7 h-7 text-white" />;
      case "champion":
        return <Crown className="w-7 h-7 text-white" />;
    }
  };

  return (
    <div
      className={`${sizeClass} shrink-0 rounded-2xl bg-gradient-to-br ${opt.gradient} border border-white/20 flex items-center justify-center shadow-lg shadow-blue-950/40`}
    >
      {renderIcon()}
    </div>
  );
};
