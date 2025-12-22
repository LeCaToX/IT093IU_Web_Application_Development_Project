import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, BookmarkIcon, PlayIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useUserStore } from '../stores/useUserStore';
import { useWatchListStore } from '../stores/useWatchListStore';
import { useNavigateWithLoading } from '../hooks/useNavigateWithLoading';
import { getImageSrc } from '../utils/imageUtils';
import OptimizedImage from '../components/OptimizedImage';
import toast from 'react-hot-toast';

const WatchListPage = () => {
    const navigate = useNavigate();
    const navigateWithLoading = useNavigateWithLoading();
    const { user } = useUserStore();
    const { watchList, loading, error, fetchWatchList, removeFromWatchList, clearWatchList } = useWatchListStore();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchWatchList(user.id);
    }, [user, fetchWatchList, navigate]);

    const handleRemoveFromWatchList = async (videoId) => {
        try {
            await removeFromWatchList(videoId);
            toast.success('Removed from watch list');
        } catch (error) {
            toast.error('Failed to remove from watch list');
        }
    };

    const handleClearWatchList = async () => {
        if (!window.confirm('Are you sure you want to clear your entire watchlist? This cannot be undone.')) {
            return;
        }
        try {
            await clearWatchList();
            toast.success('Watchlist cleared successfully');
        } catch (error) {
            toast.error('Failed to clear watchlist');
        }
    };

    if (loading) {
        return (
            <div className="nf-page min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nf-accent"></div>
                    <span className="text-nf-text-muted">Loading your watchlist...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="nf-page min-h-screen flex items-center justify-center">
                <div className="nf-card-static p-8 text-center max-w-md">
                    <div className="p-4 rounded-full bg-nf-error/10 inline-block mb-4">
                        <svg className="w-8 h-8 text-nf-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-nf-text mb-2">Something went wrong</h2>
                    <p className="text-nf-error">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="nf-page min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-nf-accent/10">
                        <BookmarkIcon className="w-7 h-7 text-nf-accent" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-nf-text">Your Watchlist</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-nf-text-secondary mt-1">
                                {watchList?.length || 0} videos saved for later
                            </p>
                            {watchList && watchList.length > 0 && (
                                <button
                                    onClick={handleClearWatchList}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-nf-text-muted hover:text-nf-error hover:bg-nf-error/10 transition-all duration-200 border border-nf-border hover:border-nf-error/50"
                                    title="Clear all videos from watchlist"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                {!watchList || watchList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 rounded-2xl bg-nf-surface mb-6">
                            <BookmarkIcon className="w-16 h-16 text-nf-text-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-nf-text mb-2">
                            Your watchlist is empty
                        </h2>
                        <p className="text-nf-text-secondary max-w-md mb-6">
                            Start adding videos to your watchlist by clicking the bookmark icon on any video.
                        </p>
                        <button
                            onClick={() => navigateWithLoading('/')}
                            className="nf-btn nf-btn-primary"
                        >
                            Browse Videos
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {watchList.map((item, index) => (
                            <div
                                key={item.id}
                                className="group nf-card-static p-4 flex items-center gap-4 hover:border-nf-border-hover transition-all duration-200"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Thumbnail */}
                                <div
                                    className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => navigateWithLoading(`/watch/${item.id}`)}
                                >
                                    <OptimizedImage
                                        src={getImageSrc(item.thumbnailUrl)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-nf-bg/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayIcon className="w-10 h-10 text-nf-accent" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => navigateWithLoading(`/watch/${item.id}`)}
                                >
                                    <h3 className="text-lg font-semibold text-nf-text line-clamp-1 group-hover:text-nf-accent transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-nf-text-muted">
                                        <span className="flex items-center gap-1.5">
                                            <StarIcon className="w-4 h-4 text-nf-accent" />
                                            {item.averageRating ? Number(item.averageRating).toFixed(1) : 'N/A'}
                                        </span>
                                        <span>{item.viewCount?.toLocaleString() || 0} views</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => handleRemoveFromWatchList(item.id)}
                                        className="p-3 rounded-lg text-nf-text-muted hover:text-nf-error hover:bg-nf-error/10 transition-all duration-200 cursor-pointer"
                                        title="Remove from watchlist"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchListPage;
