import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, Video as VideoIcon } from 'lucide-react';
import EmptyState from './ui/EmptyState';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  if (!secureUrl) {
    return (
      <EmptyState
        icon={VideoIcon}
        title="No editorial video uploaded"
        description="A video explanation has not been attached to this problem yet. Check the Solutions tab for code implementations."
      />
    );
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (amount) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + amount, duration || videoRef.current.duration)
      );
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
      setPlaybackRate(nextSpeed);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="group relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-base-300 bg-black shadow-xl"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <video
          ref={videoRef}
          src={secureUrl}
          poster={thumbnailUrl}
          onClick={togglePlayPause}
          className="w-full aspect-video cursor-pointer object-contain"
        />

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all hover:bg-black/20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-content shadow-2xl transition-transform hover:scale-110">
              <Play size={28} className="translate-x-0.5" />
            </div>
          </button>
        )}

        {/* Bottom Overlay Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 transition-opacity duration-200 ${
            isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar Slider */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] text-white/90">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="range range-primary range-xs flex-1 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-white/70">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPause}
                className="btn btn-circle btn-primary btn-xs text-primary-content"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="btn btn-circle btn-ghost btn-xs text-white/80 hover:text-white"
                title="Rewind 10 seconds"
              >
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                onClick={() => skipTime(10)}
                className="btn btn-circle btn-ghost btn-xs text-white/80 hover:text-white"
                title="Forward 10 seconds"
              >
                <RotateCw size={14} />
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="btn btn-circle btn-ghost btn-xs text-white/80 hover:text-white ml-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cycleSpeed}
                className="btn btn-ghost btn-xs text-white/80 font-mono text-[11px] hover:text-white"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="btn btn-circle btn-ghost btn-xs text-white/80 hover:text-white"
                title="Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-xs text-base-content/70">
        <p className="font-semibold text-base-content mb-1">Editorial Video Guidance</p>
        <p>Follow along with the step-by-step intuition, problem decomposition, and time-space complexity breakdown.</p>
      </div>
    </div>
  );
};

export default Editorial;
