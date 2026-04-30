export type MusicTrack = {
  title: string;
  audioSrc: string;
  coverImage: string;
};

export type MediaPlayerState = {
  currentTrackIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  isCollapsed: boolean;
  volume: number;
  currentTime: number;
  duration: number;
};

const MEDIA_PLAYER_STATE_KEY = "fairplay-media-player-state";

export function saveMediaPlayerState(state: MediaPlayerState): void {
  localStorage.setItem(MEDIA_PLAYER_STATE_KEY, JSON.stringify(state));
}

export function loadMediaPlayerState(
  defaultState: MediaPlayerState
): MediaPlayerState {
  const stored = localStorage.getItem(MEDIA_PLAYER_STATE_KEY);
  if (!stored) return defaultState;

  try {
    return JSON.parse(stored);
  } catch {
    return defaultState;
  }
}

export function clearMediaPlayerState(): void {
  localStorage.removeItem(MEDIA_PLAYER_STATE_KEY);
}

export const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    title: "FairPlay Ambient",
    audioSrc: "/media/under-the-bright-lights.mp3",
    coverImage: "/media/under-the-bright-lights.jpg",
  },
  {
    title: "Night Watch",
    audioSrc: "/media/All-Nights.mp3",
    coverImage: "/media/All-Nights.jpg",
  },
];
