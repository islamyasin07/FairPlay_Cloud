import { useEffect, useMemo, useRef, useState } from "react";
import {
	ChevronDown,
	ChevronUp,
	Music4,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
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

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60)
		.toString()
		.padStart(2, "0");
	return `${mins}:${secs}`;
}

function FloatingMusicPlayer({
	tracks,
	defaultTrackIndex = 0,
}: FloatingMusicPlayerProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const safeInitialIndex = useMemo(() => {
		if (!tracks.length) return 0;
		return Math.max(0, Math.min(defaultTrackIndex, tracks.length - 1));
	}, [defaultTrackIndex, tracks.length]);

	const [currentTrackIndex, setCurrentTrackIndex] = useState(safeInitialIndex);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		setCurrentTrackIndex(safeInitialIndex);
	}, [safeInitialIndex]);

	const currentTrack = tracks[currentTrackIndex];

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.volume = 0.55;

		const handleLoaded = () => {
			setDuration(audio.duration || 0);
			setCurrentTime(audio.currentTime || 0);
		};

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime || 0);
		};

		const handleEnded = () => {
			setCurrentTrackIndex((prev) => {
				if (!tracks.length) return prev;
				return prev === tracks.length - 1 ? 0 : prev + 1;
			});
		};

		audio.addEventListener("loadedmetadata", handleLoaded);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("loadedmetadata", handleLoaded);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [tracks.length]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentTrack) return;

		audio.load();
		setCurrentTime(0);

		if (isPlaying) {
			audio
				.play()
				.then(() => setIsPlaying(true))
				.catch(() => setIsPlaying(false));
		}
	}, [currentTrackIndex, currentTrack, isPlaying]);

	if (!tracks.length || !currentTrack) return null;

	const togglePlay = async () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
			return;
		}

		try {
			await audio.play();
			setIsPlaying(true);
		} catch {
			setIsPlaying(false);
		}
	};

	const toggleMute = () => {
		const audio = audioRef.current;
		if (!audio) return;
		const nextMutedState = !audio.muted;
		audio.muted = nextMutedState;
		setIsMuted(nextMutedState);
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

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<>
			<audio ref={audioRef} preload="metadata" muted={isMuted}>
				<source src={currentTrack.audioSrc} />
			</audio>

			<div className="fixed bottom-4 right-4 z-50 w-[300px] max-w-[calc(100vw-20px)]">
				<div className="glass-panel relative overflow-hidden rounded-[24px] border border-cyan-400/25 shadow-[0_0_28px_rgba(34,211,238,0.14)]">
					<div className="pointer-events-none absolute -left-10 top-[-26px] h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl" />
					<div className="pointer-events-none absolute -right-8 bottom-[-20px] h-24 w-24 rounded-full bg-violet-500/15 blur-3xl" />

					<div className="relative flex items-center justify-between border-b border-white/10 px-3 py-2.5">
						<div className="flex items-center gap-2">
							<div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-1.5 text-cyan-300">
								<Music4 className="h-3.5 w-3.5" />
							</div>
							<div>
								<p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/85">
									Music Player
								</p>
								<p className="text-[10px] text-slate-400">Now streaming</p>
							</div>
						</div>

						<button
							onClick={() => setIsCollapsed((prev) => !prev)}
							className="rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
						>
							{isCollapsed ? (
								<ChevronUp className="h-3.5 w-3.5" />
							) : (
								<ChevronDown className="h-3.5 w-3.5" />
							)}
						</button>
					</div>

					{!isCollapsed && (
						<div className="relative p-3">
							<div className="flex items-center gap-3">
								<div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-cyan-400/20 bg-slate-950/70 shadow-[0_0_16px_rgba(34,211,238,0.12)]">
									<img
										src={currentTrack.coverImage}
										alt={currentTrack.title}
										className="h-full w-full object-cover"
									/>
								</div>

								<div className="min-w-0 flex-1">
									<h3 className="truncate text-sm font-semibold text-white">
										{currentTrack.title}
									</h3>
									<p className="mt-1 text-xs text-slate-400">
										Track {currentTrackIndex + 1} of {tracks.length}
									</p>
									<div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
										<span>{formatTime(currentTime)}</span>
										<span>{formatTime(duration)}</span>
									</div>
								</div>
							</div>

							<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
								<div
									className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 transition-all duration-300"
									style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
								/>
							</div>

							<div className="mt-3 flex items-center justify-between gap-2">
								<button
									onClick={goToPrevious}
									className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
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
									className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
								>
									<SkipForward className="h-4 w-4" />
								</button>

								<button
									onClick={toggleMute}
									className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
								>
									{isMuted ? (
										<VolumeX className="h-4 w-4" />
									) : (
										<Volume2 className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default FloatingMusicPlayer;
