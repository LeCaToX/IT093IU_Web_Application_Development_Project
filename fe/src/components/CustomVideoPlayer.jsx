import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import {
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    Cog6ToothIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import {
    PlayIcon as PlayIconOutline,
    PauseIcon as PauseIconOutline
} from '@heroicons/react/24/outline';

const CustomVideoPlayer = ({
    url,
    title = 'Video',
    onReady,
    onError,
    onProgress,
    onEnded,
    playing: externalPlaying,
    onPlay,
    onPause,
    volume: externalVolume,
    onVolumeChange,
    playbackRate: externalPlaybackRate,
    onPlaybackRateChange,
    className = '',
    config = {}
}) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const isDraggingRef = useRef(false);
    const isDraggingVolumeRef = useRef(false);

    // Internal state
    const [playing, setPlaying] = useState(externalPlaying ?? false);
    const [volume, setVolume] = useState(externalVolume ?? 0.5);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [playedSeconds, setPlayedSeconds] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(externalPlaybackRate ?? 1);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [buffering, setBuffering] = useState(false);

    // Sync external state
    useEffect(() => {
        if (externalPlaying !== undefined) {
            setPlaying(externalPlaying);
        }
    }, [externalPlaying]);

    useEffect(() => {
        if (externalVolume !== undefined) {
            setVolume(externalVolume);
        }
    }, [externalVolume]);

    useEffect(() => {
        if (externalPlaybackRate !== undefined) {
            setPlaybackRate(externalPlaybackRate);
        }
    }, [externalPlaybackRate]);

    // Ensure volume is properly applied to player (fixes audio sync issues)
    useEffect(() => {
        if (playerRef.current && playerRef.current.getInternalPlayer) {
            try {
                const internalPlayer = playerRef.current.getInternalPlayer();
                if (internalPlayer && typeof internalPlayer.setVolume === 'function') {
                    internalPlayer.setVolume(muted ? 0 : volume * 100);
                }
            } catch (error) {
                // Ignore errors, react-player will handle volume
            }
        }
    }, [volume, muted, url]);

    // Format time helper
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle play/pause
    const handlePlayPause = useCallback(() => {
        const newPlaying = !playing;
        setPlaying(newPlaying);
        if (onPlay && newPlaying) onPlay();
        if (onPause && !newPlaying) onPause();
    }, [playing, onPlay, onPause]);

    // Handle volume change
    const handleVolumeChange = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);
        if (clampedVolume > 0) setMuted(false);
        if (onVolumeChange) onVolumeChange(clampedVolume);
    }, [onVolumeChange]);

    // Handle mute toggle
    const handleMuteToggle = useCallback(() => {
        setMuted(!muted);
    }, [muted]);

    // Handle playback rate change
    const handlePlaybackRateChange = useCallback((rate) => {
        setPlaybackRate(rate);
        setShowSettings(false);
        if (onPlaybackRateChange) onPlaybackRateChange(rate);
    }, [onPlaybackRateChange]);

    // Handle seek
    const handleSeek = useCallback((e) => {
        if (!playerRef.current || !duration) return;
        
        const rect = progressBarRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        
        playerRef.current.seekTo(newTime, 'seconds');
        setPlayed(percent);
        setPlayedSeconds(newTime);
    }, [duration]);

    // Handle progress bar drag
    const handleProgressMouseDown = useCallback((e) => {
        e.stopPropagation();
        isDraggingRef.current = true;
        handleSeek(e);
    }, [handleSeek]);

    const handleProgressMouseMove = useCallback((e) => {
        if (isDraggingRef.current) {
            e.stopPropagation();
            handleSeek(e);
        }
    }, [handleSeek]);

    const handleProgressMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    // Global mouse move/up handlers for dragging
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isDraggingRef.current && progressBarRef.current) {
                const rect = progressBarRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const newTime = percent * duration;
                if (playerRef.current && duration) {
                    playerRef.current.seekTo(newTime, 'seconds');
                    setPlayed(percent);
                    setPlayedSeconds(newTime);
                }
            }
            if (isDraggingVolumeRef.current && volumeBarRef.current) {
                const rect = volumeBarRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                handleVolumeChange(1 - percent);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
            }
            if (isDraggingVolumeRef.current) {
                isDraggingVolumeRef.current = false;
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [duration, handleVolumeChange]);

    // Handle volume slider
    const handleVolumeSliderChange = useCallback((e) => {
        e.stopPropagation();
        const rect = volumeBarRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const percent = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        handleVolumeChange(1 - percent); // Invert because volume bar goes from bottom to top
    }, [handleVolumeChange]);

    const handleVolumeMouseDown = useCallback((e) => {
        e.stopPropagation();
        isDraggingVolumeRef.current = true;
        handleVolumeSliderChange(e);
    }, [handleVolumeSliderChange]);

    // Handle fullscreen
    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            } else if (containerRef.current.mozRequestFullScreen) {
                containerRef.current.mozRequestFullScreen();
            } else if (containerRef.current.msRequestFullscreen) {
                containerRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }, [isFullscreen]);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Show/hide controls on mouse move
    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (!playing || showSettings || showVolumeSlider) return;
            setShowControls(false);
        }, 3000);
    }, [playing, showSettings, showVolumeSlider]);

    const handleMouseLeave = useCallback(() => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (!playing || showSettings || showVolumeSlider) {
            setShowControls(false);
        }
    }, [playing, showSettings, showVolumeSlider]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!containerRef.current?.contains(document.activeElement) && 
                document.activeElement?.tagName !== 'BODY') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    if (playerRef.current && duration) {
                        const newTime = Math.max(0, playedSeconds - 10);
                        playerRef.current.seekTo(newTime, 'seconds');
                    }
                    break;
                case 'arrowright':
                    e.preventDefault();
                    if (playerRef.current && duration) {
                        const newTime = Math.min(duration, playedSeconds + 10);
                        playerRef.current.seekTo(newTime, 'seconds');
                    }
                    break;
                case 'arrowup':
                    e.preventDefault();
                    handleVolumeChange(Math.min(1, volume + 0.1));
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    handleVolumeChange(Math.max(0, volume - 0.1));
                    break;
                case 'm':
                    e.preventDefault();
                    handleMuteToggle();
                    break;
                case 'f':
                    e.preventDefault();
                    handleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handlePlayPause, handleVolumeChange, handleMuteToggle, handleFullscreen, volume, playedSeconds, duration]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // ReactPlayer callbacks
    const handleReady = useCallback(() => {
        if (onReady) onReady();
    }, [onReady]);

    const handleError = useCallback((error) => {
        if (onError) onError(error);
    }, [onError]);

    const handleProgressCallback = useCallback((state) => {
        setPlayed(state.played);
        setPlayedSeconds(state.playedSeconds);
        setLoaded(state.loaded);
        if (onProgress) onProgress(state);
    }, [onProgress]);

    const handleDuration = useCallback((duration) => {
        setDuration(duration);
    }, []);

    const handleBuffer = useCallback(() => {
        setBuffering(true);
    }, []);

    const handleBufferEnd = useCallback(() => {
        setBuffering(false);
    }, []);

    const handleEnded = useCallback(() => {
        setPlaying(false);
        if (onEnded) onEnded();
    }, [onEnded]);

    // Detect if YouTube URL
    const isYouTubeUrl = url?.includes('youtube.com') || url?.includes('youtu.be');

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full bg-black group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Player */}
            <div className="relative w-full h-full">
                {/* Overlay to hide YouTube top chrome bar */}
                {isYouTubeUrl && (
                    <div 
                        className="absolute top-0 left-0 right-0 h-12 bg-black z-30 pointer-events-none"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)' }}
                    />
                )}
                <ReactPlayer
                    ref={playerRef}
                    url={url}
                    playing={playing}
                    volume={muted ? 0 : volume}
                    playbackRate={playbackRate}
                    width="100%"
                    height="100%"
                    onReady={handleReady}
                    onError={handleError}
                    onProgress={handleProgressCallback}
                    onDuration={handleDuration}
                    onBuffer={handleBuffer}
                    onBufferEnd={handleBufferEnd}
                    onEnded={handleEnded}
                    config={{
                        youtube: {
                            playerVars: {
                                controls: 0,
                                modestbranding: 1,
                                rel: 0,
                                showinfo: 0,
                                iv_load_policy: 3,
                                fs: 0,
                                disablekb: 0,
                                playsinline: 1,
                                cc_load_policy: 0,
                                enablejsapi: 1,
                                origin: window.location.origin,
                                autoplay: 0,
                                mute: 0,
                                loop: 0,
                            },
                            embedOptions: {
                                host: 'https://www.youtube.com',
                            }
                        },
                        file: {
                            attributes: {
                                controls: false,
                                playsInline: true,
                            }
                        },
                        ...config
                    }}
                />
            </div>

            {/* Buffering indicator */}
            {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Center play button overlay */}
            {!playing && (
                <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center z-30 bg-black/30 hover:bg-black/40 transition-colors"
                >
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                        <PlayIcon className="w-12 h-12 text-white ml-1" />
                    </div>
                </button>
            )}

            {/* Controls Bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressBarRef}
                    className="h-1 bg-white/20 cursor-pointer group/progress"
                    onClick={handleSeek}
                    onMouseDown={handleProgressMouseDown}
                >
                    <div className="h-full bg-white/40 relative" style={{ width: `${loaded * 100}%` }}>
                        <div
                            className="h-full bg-red-600 transition-all"
                            style={{ width: `${(played / loaded) * 100}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{ left: `${(played / loaded) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 px-4 py-2">
                    {/* Play/Pause */}
                    <button
                        onClick={handlePlayPause}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label={playing ? 'Pause' : 'Play'}
                    >
                        {playing ? (
                            <PauseIcon className="w-6 h-6 text-white" />
                        ) : (
                            <PlayIconOutline className="w-6 h-6 text-white" />
                        )}
                    </button>

                    {/* Volume Control */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <div className="relative">
                            {/* Invisible bridge area to connect button and slider - prevents gap */}
                            {showVolumeSlider && (
                                <div 
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 w-10 h-2 pointer-events-auto"
                                    onMouseEnter={() => setShowVolumeSlider(true)}
                                />
                            )}
                            <button
                                onClick={handleMuteToggle}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
                                aria-label={muted ? 'Unmute' : 'Mute'}
                            >
                                {muted || volume === 0 ? (
                                    <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                                ) : volume < 0.5 ? (
                                    <SpeakerWaveIcon className="w-6 h-6 text-white" />
                                ) : (
                                    <SpeakerWaveIcon className="w-6 h-6 text-white" />
                                )}
                            </button>
                            {showVolumeSlider && (
                                <div
                                    ref={volumeBarRef}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-10 h-28 bg-black/90 rounded flex items-center justify-center p-2 cursor-pointer z-20"
                                    onClick={handleVolumeSliderChange}
                                    onMouseDown={handleVolumeMouseDown}
                                    onMouseEnter={() => setShowVolumeSlider(true)}
                                >
                                    <div className="w-1 h-full bg-white/20 rounded-full relative">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-white rounded-full transition-all"
                                            style={{ height: `${(muted ? 0 : volume) * 100}%` }}
                                        />
                                        <div
                                            className="absolute left-1/2 w-3 h-3 bg-white rounded-full cursor-grab active:cursor-grabbing shadow-lg z-10"
                                            style={{ 
                                                bottom: `${(muted ? 0 : volume) * 100}%`,
                                                transform: 'translate(-50%, 50%)'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-white text-sm font-mono min-w-[120px]">
                        {formatTime(playedSeconds)} / {formatTime(duration)}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Settings */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Settings"
                        >
                            <Cog6ToothIcon className="w-6 h-6 text-white" />
                        </button>
                        {showSettings && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg shadow-xl min-w-[150px] py-2 z-40">
                                <div className="px-4 py-2 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-sm font-medium">Playback Speed</span>
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="text-white/60 hover:text-white"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => handlePlaybackRateChange(rate)}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                            playbackRate === rate
                                                ? 'bg-red-600 text-white'
                                                : 'text-white/80 hover:bg-white/10'
                                        }`}
                                    >
                                        {rate === 1 ? 'Normal' : `${rate}x`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={handleFullscreen}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? (
                            <ArrowsPointingInIcon className="w-6 h-6 text-white" />
                        ) : (
                            <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Click to play/pause overlay - only when controls are hidden */}
            {playing && !showControls && (
                <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={handlePlayPause}
                />
            )}
        </div>
    );
};

export default CustomVideoPlayer;

