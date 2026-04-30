import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_MUSIC_TRACKS,
  loadMediaPlayerState,
  saveMediaPlayerState,
  type MediaPlayerState,
  type MusicTrack,
} from "../../services/mediaPlayerService";

type MediaPlayerContextType = {
  tracks: MusicTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  isCollapsed: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  toggleCollapse: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setTracks: (tracks: MusicTrack[]) => void;
  currentTrack: MusicTrack | undefined;
};

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(
  undefined
);

const DEFAULT_STATE: MediaPlayerState = {
  currentTrackIndex: 0,
  isPlaying: false,
  isMuted: false,
  isCollapsed: true,
  volume: 0.08,
  currentTime: 0,
  duration: 0,
};

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_MUSIC_TRACKS);
  const [state, setState] = useState<MediaPlayerState>(() =>
    loadMediaPlayerState(DEFAULT_STATE)
  );

  const currentTrack = useMemo(() => tracks[state.currentTrackIndex], [tracks, state.currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = state.isMuted ? 0 : state.volume;
    audio.defaultPlaybackRate = 1;
    audio.src = currentTrack?.audioSrc || "";
  }, [state.volume, state.isMuted, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", updateTime);
    };
  }, []);

  useEffect(() => {
    saveMediaPlayerState(state);
  }, [state]);

  const play = () => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  };

  const pause = () => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  };

  const togglePlayPause = () => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const toggleMute = () => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleCollapse = () => {
    setState((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  };

  const setVolume = (volume: number) => {
    setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio || Number.isNaN(time)) return;

    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const nextTime = Math.max(0, Math.min(duration || time, time));

    audio.currentTime = nextTime;
    setState((prev) => ({
      ...prev,
      currentTime: nextTime,
    }));
  };

  const nextTrack = () => {
    setState((prev) => ({
      ...prev,
      currentTrackIndex:
        tracks.length > 0 ? (prev.currentTrackIndex + 1) % tracks.length : 0,
      currentTime: 0,
    }));
  };

  const previousTrack = () => {
    setState((prev) => ({
      ...prev,
      currentTrackIndex:
        tracks.length > 0
          ? (prev.currentTrackIndex - 1 + tracks.length) % tracks.length
          : 0,
      currentTime: 0,
    }));
  };

  const value = useMemo(
    () => ({
      tracks,
      currentTrackIndex: state.currentTrackIndex,
      isPlaying: state.isPlaying,
      isMuted: state.isMuted,
      isCollapsed: state.isCollapsed,
      volume: state.volume,
      currentTime: state.currentTime,
      duration: state.duration,
      play,
      pause,
      togglePlayPause,
      toggleMute,
      toggleCollapse,
      setVolume,
      seekTo,
      nextTrack,
      previousTrack,
      setTracks,
      currentTrack,
    }),
    [state, tracks, currentTrack]
  );

  return (
    <MediaPlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
      />
      {children}
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error("useMediaPlayer must be used within MediaPlayerProvider");
  }
  return context;
}
