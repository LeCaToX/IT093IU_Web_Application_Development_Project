import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from "react-router-dom";

import { BookmarkIcon } from '@heroicons/react/24/outline';
import { PlayIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import OptimizedImage from './OptimizedImage';
import CustomVideoPlayer from './CustomVideoPlayer';
import { useVideoStore } from '../stores/useVideoStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { getImageSrc } from '../utils/imageUtils';

const VideoCarousel = () => {
    const { videos, fetchAllVideos, loading: videosLoading } = useVideoStore();
    const { categories, fetchAllCategories } = useCategoryStore();
    const [current, setCurrent] = useState(0);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerVideoIndex, setTrailerVideoIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const timeoutRef = useRef(null);
    const carouselRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    // Fetch videos and categories on mount
    useEffect(() => {
        fetchAllVideos();
        fetchAllCategories();
    }, [fetchAllVideos, fetchAllCategories]);

    // Transform videos from API to carousel format
    const carouselVideos = useMemo(() => {
        if (!videos || videos.length === 0) return [];

        // Get category map for tag lookup
        const categoryMap = {};
        if (categories && Array.isArray(categories)) {
            categories.forEach(cat => {
                categoryMap[cat.id] = cat.name;
            });
        }

        // Sort videos by rating (descending) and take top 5
        const sortedVideos = [...videos]
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 5)
            .map(video => ({
                id: video.id,
                title: video.title,
                description: video.description || 'Watch now on NexFlixx',
                tags: [
                    categoryMap[video.categoryId] || 'Entertainment',
                    video.averageRating ? `${video.averageRating.toFixed(1)}★` : 'New'
                ],
                carouselImg: getImageSrc(video.thumbnailUrl),
                trailerUrl: video.url?.startsWith('http') || video.url?.startsWith('/')
                    ? video.url
                    : `/videos/${video.url}`
            }));

        return sortedVideos;
    }, [videos, categories]);

    // Reset current index if it's out of bounds
    useEffect(() => {
        if (carouselVideos.length > 0 && current >= carouselVideos.length) {
            setCurrent(0);
        }
    }, [carouselVideos.length, current]);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const closeTrailer = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowTrailer(false);
            setIsClosing(false);
        }, 300);
    };

    const scrollToNextSection = () => {
        const nextSection = document.querySelector('[data-video-section]');
        if (nextSection) {
            nextSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const scrollToCarousel = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleScroll = (event) => {
        const scrollThreshold = 50;

        if (!isScrolling) {
            const currentScrollY = window.scrollY;
            const carouselHeight = carouselRef.current?.offsetHeight || 0;

            if (event.deltaY > scrollThreshold) {
                if (currentScrollY < carouselHeight * 0.8) {
                    event.preventDefault();
                    setIsScrolling(true);
                    scrollToNextSection();

                    if (scrollTimeoutRef.current) {
                        clearTimeout(scrollTimeoutRef.current);
                    }
                    scrollTimeoutRef.current = setTimeout(() => {
                        setIsScrolling(false);
                    }, 1000);
                }
            } else if (event.deltaY < -scrollThreshold) {
                const boundaryZone = carouselHeight * 0.1;
                if (currentScrollY > carouselHeight - boundaryZone && currentScrollY <= carouselHeight + boundaryZone) {
                    event.preventDefault();
                    setIsScrolling(true);
                    scrollToCarousel();

                    if (scrollTimeoutRef.current) {
                        clearTimeout(scrollTimeoutRef.current);
                    }
                    scrollTimeoutRef.current = setTimeout(() => {
                        setIsScrolling(false);
                    }, 1000);
                }
            }
        }
    };

    // Preload images
    useEffect(() => {
        if (carouselVideos.length > 0) {
            carouselVideos.forEach(video => {
                const img = new Image();
                img.src = video.carouselImg;
            });
        }
    }, [carouselVideos]);

    useEffect(() => {
        if (carouselVideos.length === 0) return;

        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrent((prevIndex) =>
                prevIndex === carouselVideos.length - 1 ? 0 : prevIndex + 1
            );
        }, 8000);

        return () => {
            resetTimeout();
        };
    }, [current, carouselVideos.length]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && showTrailer) {
                closeTrailer();
            } else if (!showTrailer && !isScrolling) {
                if (event.key === 'ArrowDown' || event.key === 'PageDown') {
                    event.preventDefault();
                    setIsScrolling(true);
                    scrollToNextSection();
                    if (scrollTimeoutRef.current) {
                        clearTimeout(scrollTimeoutRef.current);
                    }
                    scrollTimeoutRef.current = setTimeout(() => {
                        setIsScrolling(false);
                    }, 1000);
                } else if (event.key === 'ArrowUp' || event.key === 'PageUp' || event.key === 'Home') {
                    event.preventDefault();
                    setIsScrolling(true);
                    scrollToCarousel();
                    if (scrollTimeoutRef.current) {
                        clearTimeout(scrollTimeoutRef.current);
                    }
                    scrollTimeoutRef.current = setTimeout(() => {
                        setIsScrolling(false);
                    }, 1000);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showTrailer, isScrolling]);

    useEffect(() => {
        const handleWheelEvent = (event) => {
            handleScroll(event);
        };

        document.addEventListener('wheel', handleWheelEvent, { passive: false });

        return () => {
            document.removeEventListener('wheel', handleWheelEvent);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Show loading or empty state
    if (videosLoading) {
        return (
            <div ref={carouselRef} className="w-full overflow-hidden relative aspect-[16/9] max-h-[100vh] bg-nf-bg flex items-center justify-center">
                <div className="text-nf-text-secondary">Loading featured videos...</div>
            </div>
        );
    }

    if (carouselVideos.length === 0) {
        return (
            <div ref={carouselRef} className="w-full overflow-hidden relative aspect-[16/9] max-h-[100vh] bg-nf-bg flex items-center justify-center">
                <div className="text-nf-text-secondary">No videos available</div>
            </div>
        );
    }

    return (
        <div ref={carouselRef} className="w-full overflow-hidden relative aspect-[16/9] max-h-[100vh]">
            {/* Slides */}
            {carouselVideos.map((video, index) => (
                <div
                    key={video.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform-gpu ${current === index
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0'
                        }`}
                >
                    <div className="relative w-full h-full bg-nf-bg">
                        <img
                            src={video.carouselImg}
                            alt={`Slide ${video.id + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover object-center transition-all duration-1000 ease-out transform-gpu"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                width: '100%',
                                height: '120%'
                            }}
                        />
                    </div>
                </div>
            ))}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-nf-bg via-nf-bg/50 to-transparent z-20" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-nf-bg via-nf-bg/80 to-transparent z-10" />

            {/* Content overlay */}
            <div className="absolute inset-0 z-20">
                <div className="h-full flex items-center">
                    <div className="relative w-full max-w-2xl ml-8 sm:ml-12 md:ml-16 lg:ml-20 xl:ml-24 2xl:ml-32">
                        {/* Text content for each slide */}
                        {carouselVideos.map((video, index) => (
                            <div
                                key={index}
                                className={`${current === index ? 'block' : 'hidden'} transition-all duration-700 ease-out`}
                            >
                                <h1 className="text-4xl md:text-6xl font-bold text-nf-text mb-6 drop-shadow-lg">
                                    {video.title}
                                </h1>

                                <ul className="flex flex-wrap gap-2 mb-6">
                                    {video.tags.map((tag) => (
                                        <li key={tag} className="nf-tag">
                                            {tag}
                                        </li>
                                    ))}
                                </ul>

                                <p className="hidden lg:block text-lg text-nf-text-secondary mb-6 max-w-md line-clamp-2">
                                    {video.description && video.description.length > 120
                                        ? `${video.description.substring(0, 120)}...`
                                        : video.description}
                                </p>
                            </div>
                        ))}

                        {/* Action buttons */}
                        <div className="hidden md:block mt-4">
                            <div className="flex items-center gap-3 mb-6">
                                <Link
                                    to={`/watch/${carouselVideos[current].id}`}
                                    className="nf-btn nf-btn-primary"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    Watch Now
                                </Link>

                                <button
                                    onClick={() => {
                                        setTrailerVideoIndex(current);
                                        setShowTrailer(true);
                                    }}
                                    className="nf-btn nf-btn-ghost backdrop-blur-sm"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    Watch Trailer
                                </button>

                                <button className="p-3 rounded-lg border border-nf-border hover:border-nf-accent hover:bg-nf-accent/10 text-nf-text-secondary hover:text-nf-accent transition-all duration-200 cursor-pointer">
                                    <BookmarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Slide indicators */}
                            <div className="flex gap-2">
                                {carouselVideos.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${current === index
                                            ? "w-10 bg-nf-accent"
                                            : "w-6 bg-nf-text-muted/40 hover:bg-nf-text-muted"
                                            }`}
                                        onClick={() => {
                                            setCurrent(index);
                                            resetTimeout();
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll down button */}
            <div className="absolute bottom-8 sm:bottom-12 md:bottom-20 right-4 sm:right-6 md:right-8 z-30 flex flex-col items-center gap-2">
                <div className="hidden lg:block text-center text-xs text-nf-text-muted mb-2 font-medium">
                    Use ↑↓ or scroll
                </div>

                <button
                    onClick={scrollToNextSection}
                    className="group flex flex-col items-center gap-1 p-3 nf-glass rounded-full transition-all duration-300 hover:scale-110 animate-bounce-gentle hover:animate-none"
                    title="Scroll to videos"
                >
                    <ChevronDownIcon className="w-5 h-5 text-nf-text-secondary group-hover:text-nf-accent transition-colors" />
                    <span className="text-xs text-nf-text-muted group-hover:text-nf-text font-medium">
                        Explore
                    </span>
                </button>
            </div>

            {/* Trailer Modal */}
            {showTrailer && carouselVideos.length > 0 && carouselVideos[trailerVideoIndex] && (
                <div
                    className={`fixed inset-0 bg-nf-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'
                        }`}
                    onClick={closeTrailer}
                >
                    <div
                        className={`relative nf-card-static overflow-hidden max-w-4xl w-full max-h-[80vh] transition-all duration-400 ${isClosing ? 'animate-scale-down' : 'animate-scale-up'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeTrailer}
                            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-nf-bg/80 hover:bg-nf-surface text-nf-text-secondary hover:text-nf-text transition-all duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Video */}
                        <div className={`relative w-full transition-all duration-500 ${isClosing ? 'animate-slide-down' : 'animate-slide-up'
                            }`} style={{ paddingBottom: '56.25%' }}>
                            {carouselVideos[trailerVideoIndex].trailerUrl && (
                                <div className="absolute inset-0 w-full h-full">
                                    <CustomVideoPlayer
                                        url={carouselVideos[trailerVideoIndex].trailerUrl}
                                        title={`${carouselVideos[trailerVideoIndex].title} Trailer`}
                                        playing={false}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Title bar */}
                        <div className={`p-4 bg-nf-surface border-t border-nf-border transition-all duration-500 ${isClosing ? 'animate-slide-down-delayed' : 'animate-slide-up-delayed'
                            }`}>
                            <h3 className="text-nf-text text-xl font-bold">
                                {carouselVideos[trailerVideoIndex].title} - Trailer
                            </h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VideoCarousel
