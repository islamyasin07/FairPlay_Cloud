import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Music4,
  SkipBack,
  SkipForward,
} from "lucide-react";

export type MusicTrack = {
  title: string;
  audioSrc: string;
  coverImage: string;
};

type FloatingMusicPlayerProps = {
  tracks: MusicTrack[];
  defaultTrackIndex?: number;
};

function FloatingMusicPlayer({
  tracks,
  defaultTrackIndex = 0,
}: FloatingMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(defaultTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const currentTrack = useMemo(
    () => tracks[currentTrackIndex],
    [tracks, currentTrackIndex]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.pause();
    audio.load();

    if (isPlaying) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("Playback failed:", error));
    }
  }, [currentTrackIndex, currentTrack, isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Playback failed:", error);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (value > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const goToPrevious = () => {
    setCurrentTrackIndex((prev) =>
      prev === 0 ? tracks.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentTrackIndex((prev) =>
      prev === tracks.length - 1 ? 0 : prev + 1
    );
  };

  if (!tracks.length || !currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src={currentTrack.audioSrc} />
      </audio>

      <div className="fixed bottom-4 right-4 z-40 w-[260px] max-w-[calc(100vw-20px)] sm:w-[280px]">
        <div className="glass-panel overflow-hidden rounded-[24px] border border-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-1.5">
                <Music4 className="h-3.5 w-3.5 text-cyan-300" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
                  Audio Panel
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  Ambient Playback
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="rounded-xl border border-slate-700 bg-slate-900/70 p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {isCollapsed ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {!isCollapsed && (
            <div className="space-y-3 p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                  <img
                    src={currentTrack.coverImage}
                    alt={currentTrack.title}
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      isPlaying ? "scale-105" : "scale-100"
                    }`}
                  />
                  {isPlaying && (
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-cyan-400/20 shadow-[inset_0_0_18px_rgba(34,211,238,0.18)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {currentTrack.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Track {currentTrackIndex + 1} of {tracks.length}
                  </p>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 transition-all duration-500 ${
                        isPlaying ? "w-4/5" : "w-1/3"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </button>

                <button
                  onClick={goToNext}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
                  />

                  <span className="w-9 text-right text-[11px] text-slate-400">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FloatingMusicPlayer;