import { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  Music4,
  SkipBack,
  SkipForward,
  LoaderCircle,
} from "lucide-react";
import { useMediaPlayer } from "./MediaPlayerContext";

export function PersistentMediaPlayer() {
  const {
    currentTrack,
    isPlaying,
    isMuted,
    isCollapsed,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    toggleMute,
    toggleCollapse,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
  } = useMediaPlayer();

  const [coverFailed, setCoverFailed] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formattedCurrentTime = `${Math.floor(currentTime / 60)}:${String(
    Math.floor(currentTime % 60)
  ).padStart(2, "0")}`;
  const formattedDuration = `${Math.floor(duration / 60)}:${String(
    Math.floor(duration % 60)
  ).padStart(2, "0")}`;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isCollapsed
          ? "bottom-6 right-6 h-16 w-16"
          : "bottom-6 right-6 h-auto w-96"
      }`}
    >
      <div className="flex flex-col gap-3">
        {!isCollapsed && (
          <div className="glass-panel rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl">
            {/* Track Info */}
            <div className="mb-4 flex items-center gap-3">
              {currentTrack.coverImage && !coverFailed ? (
                <img
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  className="h-12 w-12 rounded-lg border border-cyan-400/10 object-cover"
                  onError={() => setCoverFailed(true)}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-500/10">
                  <Music4 className="h-6 w-6 text-cyan-400" />
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-white">
                  {currentTrack.title}
                </p>
                <p className="truncate text-xs text-slate-400">
                  Now Playing
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 space-y-2">
              <input
                type="range"
                min="0"
                max={Number.isFinite(duration) && duration > 0 ? duration : 0}
                step="0.1"
                value={Number.isFinite(currentTime) ? currentTime : 0}
                onChange={(event) => seekTo(parseFloat(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700/50 accent-cyan-400"
                aria-label="Seek playback"
                title="Drag to seek"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formattedCurrentTime}</span>
                <span>{formattedDuration}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <button
                onClick={previousTrack}
                className="rounded-full p-2 transition-all hover:bg-slate-700/50 active:scale-95"
                title="Previous track"
              >
                <SkipBack className="h-4 w-4 text-slate-300" />
              </button>

              <button
                onClick={togglePlayPause}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-3 shadow-lg transition-all hover:shadow-cyan-500/50 active:scale-95"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-white text-white" />
                ) : (
                  <Play className="h-5 w-5 fill-white text-white" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="rounded-full p-2 transition-all hover:bg-slate-700/50 active:scale-95"
                title="Next track"
              >
                <SkipForward className="h-4 w-4 text-slate-300" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="rounded-full p-2 transition-all hover:bg-slate-700/50"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-cyan-300" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                }}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700/50 outline-none accent-cyan-400"
                title="Volume"
                aria-label="Adjust volume"
              />

              <span className="w-8 text-right text-xs text-slate-400">
                {Math.round(isMuted ? 0 : volume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Collapsed Button */}
        <button
          onClick={toggleCollapse}
          className={`flex items-center justify-center rounded-full border shadow-lg transition-all active:scale-95 ${
            isCollapsed
              ? "h-16 w-16 border-cyan-400/20 bg-gradient-to-br from-cyan-500/90 to-blue-600/90 hover:shadow-cyan-500/50"
              : "border-cyan-400/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-2 hover:bg-slate-800/90"
          }`}
          title={isCollapsed ? "Expand player" : "Collapse player"}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center gap-1">
              {isPlaying ? (
                <LoaderCircle className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Music4 className="h-6 w-6 text-white" />
              )}
              <span className="text-[10px] text-white">
                {isPlaying ? "LIVE" : "READY"}
              </span>
            </div>
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </div>
    </div>
  );
}

export default PersistentMediaPlayer;
