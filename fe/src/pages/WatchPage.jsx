import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from "../config/axios";

import { useUserStore } from '../stores/useUserStore';
import { useVideoStore } from "../stores/useVideoStore";
import { useCommentStore } from "../stores/useCommentStore";
import { useWatchListStore } from '../stores/useWatchListStore'
import { useCommentInteractionStore } from '../stores/useCommentInteractionStore'

import { getImageSrc } from '../utils/imageUtils';
import { useNavigateWithLoading } from '../hooks/useNavigateWithLoading';

import OptimizedImage from '../components/OptimizedImage';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import {
    StarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    EyeIcon,
    ClockIcon,
    PlayIcon
} from '@heroicons/react/24/solid';
import {
    BookmarkIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

import { formatDate } from "../config/format";

const WatchPage = () => {
    const { id } = useParams();
    const navigateWithLoading = useNavigateWithLoading();

    const { user } = useUserStore();
    const { video, videos, similarVideos, loading, fetchVideo, fetchAllVideos, fetchSimilarVideos } = useVideoStore();
    const { videoComments, loadingComment, createComment, fetchCommentByVideo, deleteComment, createReply } = useCommentStore();
    const { addToWatchList, removeFromWatchList, isInWatchList } = useWatchListStore();
    const { likeComment, dislikeComment, removeLike, removeDislike } = useCommentInteractionStore();

    // State
    const [userRating, setUserRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [newReply, setNewReply] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [toggleReplies, setToggleReplies] = useState(null);
    const [replyToComment, setReplyToComment] = useState(null);
    const [isInWatchListState, setIsInWatchListState] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [showRatingDropdown, setShowRatingDropdown] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    // Fetch video and comments
    useEffect(() => {
        setVideoError(false);
        setVideoLoaded(false);
        if (id) {
            fetchVideo(id);
            fetchSimilarVideos(id);
        }
    }, [id, fetchVideo, fetchSimilarVideos]);

    useEffect(() => {
        fetchCommentByVideo(id);
    }, [id, fetchCommentByVideo]);

    useEffect(() => {
        if (video && user) {
            setIsInWatchListState(isInWatchList(video.id));
        }
    }, [video, user, isInWatchList]);

    // Handlers
    const handleSubmitRating = async (rating) => {
        try {
            if (rating === 0) {
                // Remove rating when 0 is selected
                await axios.delete(`/ratings/${user.id}/${video.id}`);
                setUserRating(0);
                toast.success('Rating removed!');
            } else {
                await axios.post("/ratings", { videoId: video.id, userId: user.id, rating: parseInt(rating) });
                setUserRating(rating);
                toast.success(`Rated ${rating} stars!`);
            }
            setShowRatingDropdown(false);
            await fetchVideo(id);
        } catch (err) {
            toast.error('Could not update rating.');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await createComment({ content: newComment, userId: user.id, videoId: video.id });
            toast.success('Comment posted!');
            setNewComment('');
            await fetchCommentByVideo(id);
        } catch (err) {
            toast.error('Could not post comment.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            toast.success('Comment deleted!');
            await fetchCommentByVideo(id);
        } catch (err) {
            toast.error('Could not delete comment.');
        }
    };

    const handleSubmitReply = async (e, commentId) => {
        e.preventDefault();
        if (!newReply.trim()) return;
        try {
            await createReply({ content: newReply, userId: user.id, videoId: video.id, parentCommentId: commentId });
            toast.success('Reply posted!');
            setNewReply('');
            setReplyToComment(null);
            await fetchCommentByVideo(id);
        } catch (err) {
            toast.error('Could not post reply.');
        }
    };

    const handleWatchListToggle = async () => {
        try {
            if (isInWatchListState) {
                await removeFromWatchList(video.id);
                toast.success('Removed from watch list');
            } else {
                await addToWatchList(video.id);
                toast.success('Added to watch list');
            }
            setIsInWatchListState(!isInWatchListState);
        } catch (error) {
            toast.error('Failed to update watch list');
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            // Find comment in top-level comments or in replies
            let comment = videoComments.find(c => c.id === commentId);
            if (!comment) {
                // Search in replies
                for (const c of videoComments) {
                    if (c.replies) {
                        comment = c.replies.find(r => r.id === commentId);
                        if (comment) break;
                    }
                }
            }
            if (!comment) {
                toast.error('Comment not found');
                return;
            }
            if (comment.likedByUser) {
                await removeLike(commentId, user.id);
            } else {
                if (comment.dislikedByUser) await removeDislike(commentId, user.id);
                await likeComment(commentId, user.id);
            }
            fetchCommentByVideo(id);
        } catch (error) {
            toast.error('Failed to update like');
        }
    };

    const handleDislikeComment = async (commentId) => {
        try {
            // Find comment in top-level comments or in replies
            let comment = videoComments.find(c => c.id === commentId);
            if (!comment) {
                // Search in replies
                for (const c of videoComments) {
                    if (c.replies) {
                        comment = c.replies.find(r => r.id === commentId);
                        if (comment) break;
                    }
                }
            }
            if (!comment) {
                toast.error('Comment not found');
                return;
            }
            if (comment.dislikedByUser) {
                await removeDislike(commentId, user.id);
            } else {
                if (comment.likedByUser) await removeLike(commentId, user.id);
                await dislikeComment(commentId, user.id);
            }
            fetchCommentByVideo(id);
        } catch (error) {
            toast.error('Failed to update dislike');
        }
    };

    const handleVideoLoad = () => {
        setVideoLoaded(true);
        setVideoError(false);
    };

    const handleVideoError = () => {
        setVideoError(true);
        setVideoLoaded(false);
    };

    const retryVideoLoad = () => {
        setVideoError(false);
        setVideoLoaded(false);
        // Force re-render of video player by updating key
        if (video) {
            fetchVideo(id);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    // Get similar videos from API (exclude current video just in case)
    const relatedVideos = similarVideos?.filter(v => v.id !== parseInt(id)).slice(0, 8) || [];

    return (
        <div className="watch-page min-h-screen">
            {/* Ambient glow effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-[1800px] mx-auto px-4 lg:px-8 py-6">
                <div className="flex flex-col xl:flex-row gap-6">

                    {/* Main Content (Left) */}
                    <div className="flex-1 min-w-0">

                        {/* Video Player */}
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-2xl shadow-black/50">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-zinc-400 text-sm">Loading video...</p>
                                    </div>
                                </div>
                            ) : videoError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                                        <PlayIcon className="w-8 h-8 text-rose-400" />
                                    </div>
                                    <p className="text-zinc-300 mb-2">Failed to load video</p>
                                    <p className="text-zinc-500 text-sm mb-4">The video file might be unavailable</p>
                                    <button onClick={retryVideoLoad} className="watch-btn-accent">
                                        Retry
                                    </button>
                                </div>
                            ) : video?.url ? (
                                <CustomVideoPlayer
                                    url={video.url.startsWith('http') || video.url.startsWith('/') 
                                        ? video.url 
                                        : `/videos/${video.url}`}
                                    title={video.title}
                                    onError={handleVideoError}
                                    onReady={handleVideoLoad}
                                    className="rounded-xl"
                                />
                            ) : null}
                        </div>

                        {/* Video Info */}
                        {video && (
                            <div className="mt-4 space-y-4">
                                {/* Title */}
                                <h1 className="text-xl lg:text-2xl font-bold text-zinc-100 leading-tight">
                                    {video.title}
                                </h1>

                                {/* Meta Row */}
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                                        {video.categoryName || 'Uncategorized'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <EyeIcon className="w-4 h-4" />
                                        <span>{video.viewCount?.toLocaleString() || 0} views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <StarIcon className="w-4 h-4 text-amber-400" />
                                        <span>{video.averageRating?.toFixed(1) || '0.0'}</span>
                                        <span className="text-zinc-500">({video.ratingCount || 0})</span>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex flex-wrap items-center gap-2 py-3 border-y border-zinc-800">
                                    {/* Rating */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowRatingDropdown(!showRatingDropdown)}
                                            className="watch-btn-ghost flex items-center gap-2"
                                        >
                                            <StarIcon className="w-5 h-5 text-amber-400" />
                                            <span>Rate</span>
                                        </button>
                                        {showRatingDropdown && (
                                            <div className="absolute top-full left-0 mt-2 p-3 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl z-20">
                                                <div
                                                    className="flex items-center gap-1"
                                                    onMouseLeave={() => setHoverRating(0)}
                                                >
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => handleSubmitRating(star)}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                                            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                                        >
                                                            <StarIcon className={`w-6 h-6 transition-colors ${(hoverRating > 0 ? star <= hoverRating : star <= userRating)
                                                                ? 'text-amber-400'
                                                                : 'text-zinc-600'
                                                                }`} />
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => handleSubmitRating(0)}
                                                        className="p-2 ml-1 hover:bg-zinc-700 rounded-lg transition-colors group"
                                                        title="Remove rating"
                                                    >
                                                        <svg className="w-5 h-5 text-zinc-500 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <span className="ml-2 text-sm font-medium text-zinc-300 min-w-[40px]">
                                                        {hoverRating > 0 ? hoverRating : userRating}/5
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Save to Watchlist */}
                                    <button
                                        onClick={handleWatchListToggle}
                                        className={`watch-btn-ghost flex items-center gap-2 ${isInWatchListState ? 'text-amber-400 border-amber-500/50' : ''}`}
                                    >
                                        <BookmarkIcon className={`w-5 h-5 ${isInWatchListState ? 'fill-amber-400' : ''}`} />
                                        <span>{isInWatchListState ? 'Saved' : 'Save'}</span>
                                    </button>

                                    {/* Share */}
                                    <button onClick={handleShare} className="watch-btn-ghost flex items-center gap-2">
                                        <ShareIcon className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>
                                </div>

                                {/* Description */}
                                <div className="watch-card p-4">
                                    <div
                                        className={`text-zinc-300 text-sm leading-relaxed ${!showDescription ? 'line-clamp-2' : ''}`}
                                    >
                                        {video.description || 'No description available.'}
                                    </div>
                                    {video.description && video.description.length > 100 && (
                                        <button
                                            onClick={() => setShowDescription(!showDescription)}
                                            className="mt-2 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
                                        >
                                            {showDescription ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>

                                {/* Comments Section */}
                                <div className="mt-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <ChatBubbleLeftIcon className="w-5 h-5 text-zinc-400" />
                                        <h2 className="text-lg font-semibold text-zinc-100">
                                            {videoComments.length} Comment{videoComments.length !== 1 ? 's' : ''}
                                        </h2>
                                    </div>

                                    {/* Comment Input */}
                                    {user && (
                                        <form onSubmit={handleSubmitComment} className="mb-8">
                                            <div className="flex gap-3">
                                                <img
                                                    src={getImageSrc(user.avatar, '/assets/')}
                                                    alt="Your avatar"
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/avatar.png'; }}
                                                />
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Add a comment..."
                                                        className="watch-input w-full"
                                                    />
                                                    {newComment.trim() && (
                                                        <div className="flex justify-end gap-2 mt-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setNewComment('')}
                                                                className="watch-btn-ghost"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={loadingComment}
                                                                className="watch-btn-accent"
                                                            >
                                                                {loadingComment ? 'Posting...' : 'Comment'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-6">
                                        {videoComments.map((comment) => (
                                            <div key={comment.id} className="group">
                                                <div className="flex gap-3">
                                                    <img
                                                        src={getImageSrc(comment.userAvatarUrl, '/assets/')}
                                                        alt={comment.username}
                                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/avatar.png'; }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-zinc-200">{comment.username}</span>
                                                            <span className="text-xs text-zinc-500">{formatDate(comment.datePosted)}</span>
                                                        </div>
                                                        <p className="text-zinc-300 text-sm mb-2">{comment.content}</p>

                                                        {/* Comment Actions */}
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => handleLikeComment(comment.id)}
                                                                className={`flex items-center gap-1.5 text-sm transition-colors ${comment.likedByUser ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                            >
                                                                <HandThumbUpIcon className="w-4 h-4" />
                                                                <span>{comment.likes || 0}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDislikeComment(comment.id)}
                                                                className={`flex items-center gap-1.5 text-sm transition-colors ${comment.dislikedByUser ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                            >
                                                                <HandThumbDownIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyToComment(replyToComment === comment.id ? null : comment.id)}
                                                                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                                                            >
                                                                <ChatBubbleLeftIcon className="w-4 h-4" />
                                                                Reply
                                                            </button>
                                                            {user?.id === comment.userId && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Reply Input */}
                                                        {replyToComment === comment.id && (
                                                            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4 pl-4 border-l-2 border-zinc-700">
                                                                <input
                                                                    type="text"
                                                                    value={newReply}
                                                                    onChange={(e) => setNewReply(e.target.value)}
                                                                    placeholder="Write a reply..."
                                                                    className="watch-input w-full text-sm"
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-2 mt-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setReplyToComment(null); setNewReply(''); }}
                                                                        className="watch-btn-ghost text-sm py-1.5"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={!newReply.trim()}
                                                                        className="watch-btn-accent text-sm py-1.5"
                                                                    >
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}

                                                        {/* Replies Toggle */}
                                                        {comment.replies?.length > 0 && (
                                                            <button
                                                                onClick={() => setToggleReplies(toggleReplies === comment.id ? null : comment.id)}
                                                                className="flex items-center gap-1.5 mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                                                            >
                                                                {toggleReplies === comment.id ? (
                                                                    <ChevronUpIcon className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronDownIcon className="w-4 h-4" />
                                                                )}
                                                                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                                                            </button>
                                                        )}

                                                        {/* Replies List */}
                                                        {toggleReplies === comment.id && comment.replies && (
                                                            <div className="mt-4 pl-4 border-l-2 border-zinc-800 space-y-4">
                                                                {comment.replies.map((reply) => (
                                                                    <div key={reply.id} className="flex gap-3 group/reply">
                                                                        <img
                                                                            src={getImageSrc(reply.userAvatarUrl, '/assets/')}
                                                                            alt={reply.username}
                                                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/avatar.png'; }}
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="font-medium text-zinc-200 text-sm">{reply.username}</span>
                                                                                <span className="text-xs text-zinc-500">{formatDate(reply.datePosted)}</span>
                                                                            </div>
                                                                            <p className="text-zinc-300 text-sm">{reply.content}</p>
                                                                            <div className="flex items-center gap-3 mt-2">
                                                                                <button
                                                                                    onClick={() => handleLikeComment(reply.id)}
                                                                                    className={`flex items-center gap-1 text-xs transition-colors ${reply.likedByUser ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                                                >
                                                                                    <HandThumbUpIcon className="w-3.5 h-3.5" />
                                                                                    <span>{reply.likes || 0}</span>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDislikeComment(reply.id)}
                                                                                    className={`text-xs transition-colors ${reply.dislikedByUser ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                                                >
                                                                                    <HandThumbDownIcon className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                {user?.id === reply.userId && (
                                                                                    <button
                                                                                        onClick={() => handleDeleteComment(reply.id)}
                                                                                        className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                                                                                    >
                                                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {videoComments.length === 0 && (
                                            <div className="text-center py-12">
                                                <ChatBubbleLeftIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                                                <p className="text-zinc-500">No comments yet. Be the first to comment!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Related Videos (Right) */}
                    <div className="xl:w-[400px] flex-shrink-0">
                        <div className="xl:sticky xl:top-24">
                            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                                <PlayIcon className="w-5 h-5 text-amber-400" />
                                Up Next
                            </h2>

                            <div className="space-y-3 max-h-[calc(100vh-150px)] overflow-y-auto watch-scrollbar pr-2">
                                {relatedVideos.map((relatedVideo) => (
                                    <div
                                        key={relatedVideo.id}
                                        onClick={() => navigateWithLoading(`/watch/${relatedVideo.id}`)}
                                        className="watch-card p-2 flex gap-3 cursor-pointer group"
                                    >
                                        <div className="relative w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden">
                                            <OptimizedImage
                                                src={getImageSrc(relatedVideo.thumbnailUrl)}
                                                alt={relatedVideo.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Duration badge placeholder */}
                                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                                                <ClockIcon className="w-3 h-3 inline mr-0.5" />
                                                --:--
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="text-sm font-medium text-zinc-200 line-clamp-2 mb-1.5 group-hover:text-amber-400 transition-colors">
                                                {relatedVideo.title}
                                            </h3>
                                            <div className="space-y-1">
                                                <p className="text-xs text-zinc-500">{relatedVideo.viewCount?.toLocaleString() || 0} views</p>
                                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <StarIcon className="w-3 h-3 text-amber-400" />
                                                    <span>{relatedVideo.averageRating?.toFixed(1) || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {relatedVideos.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-zinc-500 text-sm">No related videos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchPage;
