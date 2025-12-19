import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import axios from '../config/axios';

import { useVideoStore } from "../stores/useVideoStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import ThumbnailSelector from "./ThumbnailSelector";
import { FilmIcon, DocumentTextIcon, LinkIcon, PhotoIcon, TagIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CreateVideoForm = () => {
	const { id } = useParams();
	const { createVideo, loading } = useVideoStore();
	const { categories, fetchAllCategories } = useCategoryStore();
	const videoInputRef = useRef(null);

	useEffect(() => {
		fetchAllCategories();
	}, [fetchAllCategories]);

	const [newVideo, setNewVideo] = useState({
		title: "",
		description: "",
		url: "",
		thumbnailUrl: "",
		userId: id,
		categoryId: "",
	});

	const [videoMode, setVideoMode] = useState('upload'); // 'upload' | 'url'
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [videoPreview, setVideoPreview] = useState(null);
	const [uploadedVideoName, setUploadedVideoName] = useState('');

	const handleVideoUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('video/')) {
			toast.error('Please select a video file');
			return;
		}

		// Validate file size (100MB max)
		if (file.size > 100 * 1024 * 1024) {
			toast.error('Video must be less than 100MB');
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);
		setUploadedVideoName(file.name);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await axios.post('/uploads/video', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: (progressEvent) => {
					const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					setUploadProgress(progress);
				},
			});

			const uploadedUrl = response.data.url;
			setVideoPreview(uploadedUrl);
			setNewVideo({ ...newVideo, url: uploadedUrl });
			toast.success('Video uploaded successfully!');
		} catch (error) {
			console.error('Upload failed:', error);
			toast.error(error.response?.data?.message || 'Failed to upload video');
			setUploadedVideoName('');
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const clearVideoUpload = () => {
		setVideoPreview(null);
		setUploadedVideoName('');
		setNewVideo({ ...newVideo, url: '' });
		if (videoInputRef.current) {
			videoInputRef.current.value = '';
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!newVideo.url) {
			toast.error("Please upload a video or provide a URL");
			return;
		}
		try {
			await createVideo(newVideo);
			setNewVideo({ title: "", description: "", url: "", thumbnailUrl: "", userId: id, categoryId: "" });
			setVideoPreview(null);
			setUploadedVideoName('');
			setUploadProgress(0);
		} catch {
			console.log("Error creating a new video");
		}
	};

	return (
		<motion.div
			className='nf-card-static p-8 max-w-xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2.5 rounded-lg bg-nf-accent/10">
					<FilmIcon className="w-6 h-6 text-nf-accent" />
				</div>
				<h2 className='text-2xl font-semibold text-nf-text'>Create New Video</h2>
			</div>

			<form onSubmit={handleSubmit} className='space-y-5'>
				{/* Title */}
				<div>
					<label htmlFor="title" className='block text-sm font-medium text-nf-text mb-2'>
						Title
					</label>
					<div className="relative">
						<FilmIcon className="absolute left-4 top-3.5 w-5 h-5 text-nf-text-muted pointer-events-none" />
						<input
							type="text"
							id="title"
							name="title"
							value={newVideo.title}
							onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
							placeholder="Enter video title"
							className='nf-input pl-12'
							required
						/>
					</div>
				</div>

				{/* Description */}
				<div>
					<label htmlFor="description" className='block text-sm font-medium text-nf-text mb-2'>
						Description
					</label>
					<div className="relative">
						<DocumentTextIcon className="absolute left-4 top-3.5 w-5 h-5 text-nf-text-muted pointer-events-none" />
						<textarea
							id="description"
							name="description"
							value={newVideo.description}
							onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
							rows={3}
							placeholder="Describe your video"
							className='nf-input pl-12 resize-none'
							required
						/>
					</div>
				</div>

				{/* Video Upload/URL */}
				<div>
					<label className='block text-sm font-medium text-nf-text mb-2'>
						Video
					</label>

					{/* Mode Selector */}
					<div className="flex gap-2 mb-3">
						<button
							type="button"
							onClick={() => setVideoMode('upload')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${videoMode === 'upload'
								? 'bg-nf-accent text-nf-bg shadow-lg shadow-nf-accent/20'
								: 'bg-nf-surface text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text'
								}`}
						>
							<CloudArrowUpIcon className="w-4 h-4" />
							Upload
						</button>
						<button
							type="button"
							onClick={() => setVideoMode('url')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${videoMode === 'url'
								? 'bg-nf-accent text-nf-bg shadow-lg shadow-nf-accent/20'
								: 'bg-nf-surface text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text'
								}`}
						>
							<LinkIcon className="w-4 h-4" />
							URL
						</button>
					</div>

					{/* Upload Mode */}
					{videoMode === 'upload' && (
						<div className="bg-nf-bg rounded-xl p-4 border border-nf-border">
							{!videoPreview ? (
								<div
									onClick={() => videoInputRef.current?.click()}
									className={`border-2 border-dashed border-nf-border rounded-lg p-8 text-center cursor-pointer
										hover:border-nf-accent hover:bg-nf-accent/10 transition-all duration-200
										${isUploading ? 'pointer-events-none' : ''}`}
								>
									{isUploading ? (
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-full bg-nf-accent/20 flex items-center justify-center">
												<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nf-accent"></div>
											</div>
											<p className="text-nf-text font-medium">Uploading {uploadedVideoName}...</p>
											<p className="text-nf-text-muted">{uploadProgress}%</p>
											<div className="w-full max-w-xs bg-nf-surface rounded-full h-2">
												<div
													className="bg-nf-accent h-2 rounded-full transition-all duration-300"
													style={{ width: `${uploadProgress}%` }}
												></div>
											</div>
										</div>
									) : (
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-full bg-nf-accent/20 flex items-center justify-center">
												<CloudArrowUpIcon className="w-8 h-8 text-nf-accent" />
											</div>
											<div>
												<p className="text-nf-text font-medium">Click to upload video</p>
												<p className="text-sm text-nf-text-muted">MP4, WebM, MOV up to 100MB</p>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-nf-surface rounded-lg">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-nf-accent/20 flex items-center justify-center">
												<FilmIcon className="w-5 h-5 text-nf-accent" />
											</div>
											<div>
												<p className="text-nf-text font-medium truncate max-w-[200px]">{uploadedVideoName}</p>
												<p className="text-xs text-nf-success">✓ Uploaded to Cloudinary</p>
											</div>
										</div>
										<button
											type="button"
											onClick={clearVideoUpload}
											className="p-2 text-nf-text-muted hover:text-nf-tertiary transition-colors"
										>
											<XMarkIcon className="w-5 h-5" />
										</button>
									</div>
									<video
										src={videoPreview}
										className="w-full max-h-48 rounded-lg bg-black"
										controls
									/>
								</div>
							)}
							<input
								ref={videoInputRef}
								type="file"
								accept="video/*"
								onChange={handleVideoUpload}
								className="hidden"
							/>
							<div className="mt-3 bg-nf-accent/10 border border-nf-accent/20 rounded-lg p-3">
								<p className="text-xs text-nf-text-muted">
									📦 Videos are uploaded to <span className="text-nf-accent font-medium">Cloudinary</span> for secure, fast streaming
								</p>
							</div>
						</div>
					)}

					{/* URL Mode */}
					{videoMode === 'url' && (
						<div className="relative">
							<LinkIcon className="absolute left-4 top-3.5 w-5 h-5 text-nf-text-muted pointer-events-none" />
							<input
								type="text"
								value={newVideo.url}
								onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
								placeholder="https://... or /videos/filename.mp4"
								className='nf-input pl-12'
							/>
						</div>
					)}
				</div>

				{/* Thumbnail */}
				<div>
					<label className='flex items-center gap-2 text-sm font-medium text-nf-text mb-2'>
						<PhotoIcon className="w-5 h-5 text-nf-text-muted" />
						Thumbnail
					</label>
					<ThumbnailSelector
						value={newVideo.thumbnailUrl}
						onChange={(url) => setNewVideo({ ...newVideo, thumbnailUrl: url })}
					/>
				</div>

				{/* Category */}
				<div>
					<label htmlFor='category' className='flex items-center gap-2 text-sm font-medium text-nf-text mb-2'>
						<TagIcon className="w-5 h-5 text-nf-text-muted" />
						Category
					</label>
					<select
						id='category'
						name='category'
						value={newVideo.categoryId}
						onChange={(e) => setNewVideo({ ...newVideo, categoryId: e.target.value })}
						className='nf-input cursor-pointer'
						required
					>
						<option value='' className="bg-nf-surface">Select a category</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id} className="bg-nf-surface">
								{category.name}
							</option>
						))}
					</select>
				</div>

				<button
					type='submit'
					className='nf-btn nf-btn-primary w-full py-3'
					disabled={loading || isUploading}
				>
					{loading ? (
						<span className="flex items-center gap-2">
							<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
							Creating...
						</span>
					) : (
						'Create Video'
					)}
				</button>
			</form>
		</motion.div>
	)
}

export default CreateVideoForm
