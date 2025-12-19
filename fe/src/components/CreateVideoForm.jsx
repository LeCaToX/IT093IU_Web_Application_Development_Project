import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import axios from '../config/axios';

import { useVideoStore } from "../stores/useVideoStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import ThumbnailSelector from "./ThumbnailSelector";
import { CloudArrowUpIcon, LinkIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CreateVideoForm = () => {
	const { id } = useParams(); // Get user ID from URL
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
			setUploadProgress(0);
		} catch {
			console.log("Error creating a new video");
		}
	};

	const handleVideoUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('video/')) {
			toast.error("Please select a video file");
			return;
		}

		// Validate file size (100MB limit)
		if (file.size > 100 * 1024 * 1024) {
			toast.error("Video file must be less than 100MB");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await axios.post('/uploads/video', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
				withCredentials: true,
				onUploadProgress: (progressEvent) => {
					const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					setUploadProgress(progress);
				}
			});

			const videoUrl = response.data.url;
			setNewVideo({ ...newVideo, url: videoUrl });
			setVideoPreview(videoUrl);
			toast.success("Video uploaded successfully!");
		} catch (error) {
			console.error("Error uploading video:", error);
			toast.error(error.response?.data?.message || "Failed to upload video");
		} finally {
			setIsUploading(false);
		}
	};

	const clearVideo = () => {
		setNewVideo({ ...newVideo, url: "" });
		setVideoPreview(null);
		setUploadProgress(0);
		if (videoInputRef.current) {
			videoInputRef.current.value = "";
		}
	};

	return (
		<motion.div
			className='bg-pm-gray shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<h2 className='text-2xl font-semibold mb-6 text-white'>Create Video</h2>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label htmlFor='name' className='block text-sm font-medium text-white'>
						Title
					</label>
					<input
						type='text'
						id='title'
						name='title'
						value={newVideo.title}
						onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
						className='mt-1 block w-full bg-primary-text border border-brown-600 rounded-md shadow-sm py-2
						 px-3 text-white focus:outline-none focus:ring-2
						focus:ring-brown-500 focus:border-brown-500'
						required
					/>
				</div>

				<div>
					<label htmlFor='description' className='block text-sm font-medium text-white'>
						Description
					</label>
					<textarea
						id='description'
						name='description'
						value={newVideo.description}
						onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
						rows='3'
						className='mt-1 block w-full bg-primary-text border border-brown-600 rounded-md shadow-sm
						 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brown-500 
						 focus:border-brown-500'
						required
					/>
				</div>

				{/* Video Upload Section */}
				<div>
					<label className='block text-sm font-medium text-white mb-2'>
						Video
					</label>

					{/* Mode Selector */}
					<div className="flex gap-2 mb-3">
						<button
							type="button"
							onClick={() => setVideoMode('upload')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${videoMode === 'upload'
								? 'bg-pm-purple text-white shadow-lg shadow-pm-purple/30'
								: 'bg-se-gray text-gray-300 hover:bg-pm-purple/50'
								}`}
						>
							<CloudArrowUpIcon className="w-4 h-4" />
							Upload
						</button>
						<button
							type="button"
							onClick={() => setVideoMode('url')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${videoMode === 'url'
								? 'bg-pm-purple text-white shadow-lg shadow-pm-purple/30'
								: 'bg-se-gray text-gray-300 hover:bg-pm-purple/50'
								}`}
						>
							<LinkIcon className="w-4 h-4" />
							URL
						</button>
					</div>

					{/* Upload Mode */}
					{videoMode === 'upload' && (
						<div className="bg-se-gray rounded-lg p-4">
							{!videoPreview ? (
								<div
									onClick={() => videoInputRef.current?.click()}
									className={`border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer
										hover:border-pm-purple hover:bg-pm-purple/10 transition-all duration-200
										${isUploading ? 'pointer-events-none' : ''}`}
								>
									{isUploading ? (
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-full bg-pm-purple/20 flex items-center justify-center">
												<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pm-purple"></div>
											</div>
											<p className="text-white font-medium">Uploading... {uploadProgress}%</p>
											<div className="w-full bg-gray-700 rounded-full h-2">
												<div
													className="bg-pm-purple h-2 rounded-full transition-all duration-300"
													style={{ width: `${uploadProgress}%` }}
												></div>
											</div>
										</div>
									) : (
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-full bg-pm-purple/20 flex items-center justify-center">
												<CloudArrowUpIcon className="w-8 h-8 text-pm-purple" />
											</div>
											<div>
												<p className="text-white font-medium">Click to upload video</p>
												<p className="text-sm text-gray-400">MP4, WebM, MOV up to 100MB</p>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="relative">
									<video
										src={videoPreview}
										className="w-full rounded-lg max-h-48 object-contain bg-black"
										controls
									/>
									<button
										type="button"
										onClick={clearVideo}
										className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
									>
										<XMarkIcon className="w-5 h-5 text-white" />
									</button>
								</div>
							)}
							<input
								ref={videoInputRef}
								type="file"
								accept="video/*"
								onChange={handleVideoUpload}
								className="hidden"
							/>
						</div>
					)}

					{/* URL Mode */}
					{videoMode === 'url' && (
						<input
							type='text'
							id='url'
							name='url'
							value={newVideo.url}
							onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
							placeholder='https://... or /videos/filename.mp4'
							className='mt-1 block w-full bg-primary-text border border-brown-600 rounded-md shadow-sm 
							py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brown-500
							 focus:border-brown-500'
						/>
					)}
				</div>

				<div>
					<label className='block text-sm font-medium text-white mb-2'>
						Thumbnail
					</label>
					<ThumbnailSelector
						value={newVideo.thumbnailUrl}
						onChange={(url) => setNewVideo({ ...newVideo, thumbnailUrl: url })}
					/>
				</div>

				<div>
					<label htmlFor='category' className='block text-sm font-medium text-white'>
						Category
					</label>
					<select
						id='category'
						name='category'
						value={newVideo.categoryId}
						onChange={(e) => setNewVideo({ ...newVideo, categoryId: e.target.value })}
						className='mt-1 block w-full bg-pm-gray border border-pm-purple rounded-md
						 shadow-sm py-2 px-3 text-white focus:outline-none 
						 focus:ring-2 focus:ring-pm-purple-hover focus:border-pm-purple-hover'
						required
					>
						<option value=''>Select a category</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
				</div>

				<button
					type='submit'
					className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
					shadow-sm text-sm font-medium text-white bg-pm-purple hover:bg-pm-purple-hover 
					focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
					disabled={loading || isUploading}
				>
					{loading ? (
						<>
							Creating...
						</>
					) : (
						<>
							Create Video
						</>
					)}
				</button>
			</form>
		</motion.div>
	)
}

export default CreateVideoForm

