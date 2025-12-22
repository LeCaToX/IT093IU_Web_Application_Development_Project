import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useVideoStore } from '../stores/useVideoStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useUserStore } from '../stores/useUserStore';
import { useNavigateWithLoading } from '../hooks/useNavigateWithLoading';
import { getImageSrc } from '../utils/imageUtils';

import { TrashIcon, XMarkIcon, PlayIcon, MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { StarIcon, PencilIcon, FilmIcon, ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '../components/OptimizedImage';
import ThumbnailSelector from '../components/ThumbnailSelector';
import toast from 'react-hot-toast';

const VideoList = ({ showOnlyUserVideos = false, showAllVideos = false, userId = null }) => {
    const navigate = useNavigate();
    const navigateWithLoading = useNavigateWithLoading();
    const { videos, userVideos, loading, fetchAllVideos, fetchVideosByUser, deleteVideo, updateVideo, fetchVideoAnalytics } = useVideoStore();
    const { categories, fetchAllCategories } = useCategoryStore();
    const { user, isAdmin } = useUserStore();
    const [editingVideo, setEditingVideo] = useState(null);
    const [editedVideo, setEditedVideo] = useState({
        title: '',
        description: '',
        url: '',
        thumbnailUrl: '',
        categoryId: null
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [analyticsVideo, setAnalyticsVideo] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        if (showOnlyUserVideos && userId) {
            fetchVideosByUser(userId);
        } else {
            fetchAllVideos();
        }
        fetchAllCategories();
    }, [fetchAllVideos, fetchVideosByUser, fetchAllCategories, showOnlyUserVideos, userId]);

    // Determine which videos to display
    const displayVideos = showOnlyUserVideos
        ? userVideos
        : showAllVideos
            ? videos
            : videos.filter(video => video.uploaderId === user?.id);

    // Filter videos by search query
    const filteredVideos = searchQuery.trim()
        ? displayVideos.filter(video =>
            video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.uploaderUsername?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : displayVideos;

    const handleDeleteVideo = async (videoId) => {
        try {
            await deleteVideo(videoId);
            toast.success('Video removed');
            await fetchAllVideos();
        } catch (error) {
            toast.error('Failed to remove video');
        }
    };

    const handleEditClick = (video) => {
        setEditingVideo(video.id);
        setEditedVideo({
            title: video.title,
            description: video.description,
            url: video.url,
            thumbnailUrl: video.thumbnailUrl,
            categoryId: Number(video.categoryId)
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateVideo(editingVideo, {
                ...editedVideo,
                categoryId: Number(editedVideo.categoryId)
            });
            toast.success('Video updated successfully');
            setEditingVideo(null);
            await fetchAllVideos();
        } catch (error) {
            toast.error('Failed to update video');
        }
    };

    const handleAnalyticsClick = async (video) => {
        if (analyticsVideo === video.id) {
            setAnalyticsVideo(null);
            setAnalyticsData(null);
            return;
        }

        setAnalyticsVideo(video.id);
        setAnalyticsLoading(true);
        const data = await fetchVideoAnalytics(video.id);
        setAnalyticsData(data);
        setAnalyticsLoading(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nf-accent"></div>
                <span className="text-nf-text-muted">Loading your videos...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Search Bar - show for both All Videos (admin) and My Videos (user) */}
            {(showAllVideos || showOnlyUserVideos) && (
                <div className="mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nf-text-muted" />
                        <input
                            type="text"
                            placeholder={showAllVideos ? "Search by title or uploader..." : "Search your videos..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="nf-input pl-12 w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-nf-surface-hover rounded cursor-pointer"
                            >
                                <XMarkIcon className="w-4 h-4 text-nf-text-muted" />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-sm text-nf-text-muted mt-2">
                            Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            )}

            {filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-6 rounded-2xl bg-nf-surface mb-6">
                        <FilmIcon className="w-16 h-16 text-nf-text-muted" />
                    </div>
                    <h2 className="text-xl font-semibold text-nf-text mb-2">
                        {searchQuery ? 'No videos found' : 'No videos yet'}
                    </h2>
                    <p className="text-nf-text-secondary">
                        {searchQuery
                            ? 'Try a different search term'
                            : showAllVideos
                                ? 'No videos on the platform yet'
                                : 'Create your first video to get started'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredVideos.map((item, index) => (
                        <div
                            key={item.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Video Card */}
                            <div className="group nf-card-static p-4 flex items-center gap-4 hover:border-nf-border-hover transition-all duration-200">
                                {/* Thumbnail */}
                                <div
                                    className="relative flex-shrink-0 w-36 aspect-video rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => navigateWithLoading(`/watch/${item.id}`)}
                                >
                                    <OptimizedImage
                                        src={getImageSrc(item.thumbnailUrl)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-nf-bg/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayIcon className="w-8 h-8 text-nf-accent" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => navigateWithLoading(`/watch/${item.id}`)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-nf-text line-clamp-1 group-hover:text-nf-accent transition-colors">
                                            {item.title}
                                        </h3>
                                        <span className="nf-tag text-xs py-1 px-2">
                                            {item.categoryName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-nf-text-muted">
                                        <span className="flex items-center gap-1.5">
                                            <StarIcon className="w-4 h-4 text-nf-accent" />
                                            {item.averageRating ? Number(item.averageRating).toFixed(1) : 'N/A'}
                                        </span>
                                        <span>{item.viewCount?.toLocaleString() || 0} views</span>
                                        {showAllVideos && (
                                            <span className="flex items-center gap-1.5 text-nf-secondary">
                                                <span className="text-nf-text-muted">by</span>
                                                {item.uploaderUsername || 'Unknown'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {showAllVideos && isAdmin && (
                                        <button
                                            onClick={() => handleAnalyticsClick(item)}
                                            className={`p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${analyticsVideo === item.id
                                                ? 'text-nf-accent bg-nf-accent/10'
                                                : 'text-nf-text-muted hover:text-nf-accent hover:bg-nf-accent/10'
                                                }`}
                                            title="View analytics"
                                        >
                                            <ChartBarIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2.5 rounded-lg text-nf-text-muted hover:text-nf-secondary hover:bg-nf-secondary/10 transition-all duration-200 cursor-pointer"
                                        title="Edit video"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVideo(item.id)}
                                        className="p-2.5 rounded-lg text-nf-text-muted hover:text-nf-error hover:bg-nf-error/10 transition-all duration-200 cursor-pointer"
                                        title="Delete video"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Analytics Panel */}
                            {analyticsVideo === item.id && (
                                <div className="mt-2 nf-card-static p-6 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-nf-text flex items-center gap-2">
                                            <ChartBarIcon className="w-5 h-5 text-nf-accent" />
                                            Video Analytics
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setAnalyticsVideo(null);
                                                setAnalyticsData(null);
                                            }}
                                            className="p-2 rounded-lg text-nf-text-muted hover:text-nf-text hover:bg-nf-surface-hover transition-colors cursor-pointer"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {analyticsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nf-accent"></div>
                                        </div>
                                    ) : analyticsData ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Ratings Section */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-nf-text-secondary">
                                                    <StarIcon className="w-5 h-5 text-nf-accent" />
                                                    <span className="font-medium">Ratings ({analyticsData.ratingCount || 0})</span>
                                                </div>
                                                {analyticsData.ratings?.length > 0 ? (
                                                    <div className="space-y-2 max-h-48 overflow-y-auto nf-scrollbar">
                                                        {analyticsData.ratings.map((rating, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-nf-surface">
                                                                <div className="flex items-center gap-2">
                                                                    <UserIcon className="w-4 h-4 text-nf-text-muted" />
                                                                    <span className="text-sm text-nf-text">{rating.username}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-sm font-medium text-nf-accent">{rating.rating}</span>
                                                                    <StarIcon className="w-4 h-4 text-nf-accent" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-nf-text-muted py-2">No ratings yet</p>
                                                )}
                                            </div>

                                            {/* Comments Section */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-nf-text-secondary">
                                                    <ChatBubbleLeftIcon className="w-5 h-5 text-nf-secondary" />
                                                    <span className="font-medium">Comments ({analyticsData.commentCount || 0})</span>
                                                </div>
                                                {analyticsData.commenters?.length > 0 ? (
                                                    <div className="space-y-2 max-h-48 overflow-y-auto nf-scrollbar">
                                                        {analyticsData.commenters.map((commenter, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-nf-surface">
                                                                <div className="flex items-center gap-2">
                                                                    <UserIcon className="w-4 h-4 text-nf-text-muted" />
                                                                    <span className="text-sm text-nf-text">{commenter.username}</span>
                                                                </div>
                                                                <span className="text-sm text-nf-secondary">{commenter.commentCount} comment{commenter.commentCount !== 1 ? 's' : ''}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-nf-text-muted py-2">No comments yet</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-nf-text-muted">Failed to load analytics</p>
                                    )}
                                </div>
                            )}

                            {/* Edit Form */}
                            {editingVideo === item.id && (
                                <div className="mt-2 nf-card-static p-6 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-nf-text">Edit Video</h3>
                                        <button
                                            onClick={() => setEditingVideo(null)}
                                            className="p-2 rounded-lg text-nf-text-muted hover:text-nf-text hover:bg-nf-surface-hover transition-colors cursor-pointer"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-nf-text mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                value={editedVideo.title}
                                                onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
                                                className="nf-input"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-nf-text mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                value={editedVideo.description}
                                                onChange={(e) => setEditedVideo({ ...editedVideo, description: e.target.value })}
                                                rows="3"
                                                className="nf-input resize-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="url" className="block text-sm font-medium text-nf-text mb-2">
                                                Video URL
                                            </label>
                                            <input
                                                type="text"
                                                id="url"
                                                value={editedVideo.url}
                                                onChange={(e) => setEditedVideo({ ...editedVideo, url: e.target.value })}
                                                className="nf-input"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-nf-text mb-2">
                                                Thumbnail
                                            </label>
                                            <ThumbnailSelector
                                                value={editedVideo.thumbnailUrl}
                                                onChange={(url) => setEditedVideo({ ...editedVideo, thumbnailUrl: url })}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-nf-text mb-2">
                                                Category
                                            </label>
                                            <select
                                                id="category"
                                                value={editedVideo.categoryId}
                                                onChange={(e) => setEditedVideo({ ...editedVideo, categoryId: Number(e.target.value) })}
                                                className="nf-input cursor-pointer"
                                                required
                                            >
                                                <option value="" className="bg-nf-surface">Select a category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id} className="bg-nf-surface">
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingVideo(null)}
                                                className="nf-btn nf-btn-ghost"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="nf-btn nf-btn-primary"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default VideoList
