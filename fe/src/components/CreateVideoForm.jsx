import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import axios from '../config/axios';

import { useVideoStore } from "../stores/useVideoStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import ThumbnailSelector from "./ThumbnailSelector";
import { FilmIcon, DocumentTextIcon, LinkIcon, PhotoIcon, TagIcon } from '@heroicons/react/24/outline';

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

	const formFields = [
		{
			id: 'title',
			label: 'Title',
			type: 'text',
			icon: FilmIcon,
			placeholder: 'Enter video title',
			required: true
		},
		{
			id: 'description',
			label: 'Description',
			type: 'textarea',
			icon: DocumentTextIcon,
			placeholder: 'Describe your video',
			required: true,
			rows: 3
		},
		{
			id: 'url',
			label: 'Video URL',
			type: 'text',
			icon: LinkIcon,
			placeholder: 'https://... or /videos/filename.mp4',
			required: true
		}
	];

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
				{formFields.map((field) => (
					<div key={field.id}>
						<label htmlFor={field.id} className='block text-sm font-medium text-nf-text mb-2'>
							{field.label}
						</label>
						<div className="relative">
							<field.icon className="absolute left-3.5 top-3 w-5 h-5 text-nf-text-muted" />
							{field.type === 'textarea' ? (
								<textarea
									id={field.id}
									name={field.id}
									value={newVideo[field.id]}
									onChange={(e) => setNewVideo({ ...newVideo, [field.id]: e.target.value })}
									rows={field.rows}
									placeholder={field.placeholder}
									className='nf-input pl-11 resize-none'
									required={field.required}
								/>
							) : (
								<input
									type={field.type}
									id={field.id}
									name={field.id}
									value={newVideo[field.id]}
									onChange={(e) => setNewVideo({ ...newVideo, [field.id]: e.target.value })}
									placeholder={field.placeholder}
									className='nf-input pl-11'
									required={field.required}
								/>
							)}
						</div>
					</div>
				))}

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
					disabled={loading}
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

