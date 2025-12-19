import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_THUMBNAILS, getThumbnailPath } from '../utils/thumbnailAssets';
import { PhotoIcon, LinkIcon, CheckIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import axios from '../config/axios';

const ThumbnailSelector = ({ value, onChange }) => {
  const [mode, setMode] = useState('existing'); // 'existing' | 'custom' | 'upload'
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Determine which thumbnail is currently selected from existing
  const selectedThumbnail = AVAILABLE_THUMBNAILS.find(t =>
    value === getThumbnailPath(t.filename) || value === t.filename
  );

  // Handle mode changes
  useEffect(() => {
    if (mode === 'custom' && customUrl) {
      onChange(customUrl);
    }
  }, [mode, customUrl, onChange]);

  // Handle custom URL changes
  const handleCustomUrlChange = (url) => {
    setCustomUrl(url);
    if (mode === 'custom') {
      onChange(url);
    }
  };

  // Handle existing thumbnail selection
  const handleSelectExisting = (thumbnail) => {
    onChange(getThumbnailPath(thumbnail.filename));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/uploads/thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      const thumbnailUrl = response.data.url;
      setUploadedPreview(thumbnailUrl);
      onChange(thumbnailUrl);
      toast.success("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error(error.response?.data?.message || "Failed to upload thumbnail");
    } finally {
      setIsUploading(false);
    }
  };

  // Clear uploaded thumbnail
  const clearUpload = () => {
    setUploadedPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get preview image source
  const getPreviewSrc = () => {
    if (mode === 'existing' && selectedThumbnail) {
      return getThumbnailPath(selectedThumbnail.filename);
    } else if (mode === 'custom' && customUrl) {
      return customUrl;
    } else if (mode === 'upload' && uploadedPreview) {
      return uploadedPreview;
    }
    return null;
  };

  const previewSrc = getPreviewSrc();

  return (
    <div className="space-y-4">
      {/* Mode Selector Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${mode === 'existing'
            ? 'bg-pm-purple text-white shadow-lg shadow-pm-purple/30'
            : 'bg-se-gray text-gray-300 hover:bg-pm-purple/50'
            }`}
        >
          <PhotoIcon className="w-4 h-4" />
          Existing
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${mode === 'upload'
            ? 'bg-pm-purple text-white shadow-lg shadow-pm-purple/30'
            : 'bg-se-gray text-gray-300 hover:bg-pm-purple/50'
            }`}
        >
          <CloudArrowUpIcon className="w-4 h-4" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${mode === 'custom'
            ? 'bg-pm-purple text-white shadow-lg shadow-pm-purple/30'
            : 'bg-se-gray text-gray-300 hover:bg-pm-purple/50'
            }`}
        >
          <LinkIcon className="w-4 h-4" />
          URL
        </button>
      </div>

      {/* Mode Content */}
      <div className="bg-se-gray rounded-lg p-4">
        {/* Existing Thumbnails Grid */}
        {mode === 'existing' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {AVAILABLE_THUMBNAILS.map((thumbnail) => {
              const isSelected = selectedThumbnail?.filename === thumbnail.filename;
              return (
                <button
                  key={thumbnail.filename}
                  type="button"
                  onClick={() => handleSelectExisting(thumbnail)}
                  className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group ${isSelected
                    ? 'ring-3 ring-pm-purple scale-105 shadow-lg shadow-pm-purple/40'
                    : 'ring-1 ring-gray-600 hover:ring-pm-purple hover:scale-102'
                    }`}
                >
                  <img
                    src={getThumbnailPath(thumbnail.filename)}
                    alt={thumbnail.label}
                    className="w-full h-full object-contain bg-gray-800 p-2"
                  />
                  {/* Selection overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-pm-purple/30 flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  )}
                  {/* Label on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white truncate">{thumbnail.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="space-y-3">
            {!uploadedPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
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
                    <div className="w-full max-w-xs bg-gray-700 rounded-full h-2">
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
                      <p className="text-white font-medium">Click to upload thumbnail</p>
                      <p className="text-sm text-gray-400">JPG, PNG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={uploadedPreview}
                  alt="Uploaded thumbnail"
                  className="w-full max-h-48 object-contain rounded-lg bg-gray-800"
                />
                <button
                  type="button"
                  onClick={clearUpload}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-400">
                📦 Images are uploaded to <span className="text-blue-300">Cloudinary</span> for secure, fast delivery
              </p>
            </div>
          </div>
        )}

        {/* Custom URL Input */}
        {mode === 'custom' && (
          <div className="space-y-3">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => handleCustomUrlChange(e.target.value)}
              placeholder="Enter image URL (https://...)"
              className="w-full bg-primary-text border border-gray-600 rounded-md py-2 px-3 text-white 
                                focus:outline-none focus:ring-2 focus:ring-pm-purple focus:border-pm-purple"
            />
            {customUrl && (
              <div className="flex justify-center">
                <img
                  src={customUrl}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {previewSrc && mode !== 'upload' && (
        <div className="bg-se-gray rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Selected Thumbnail:</p>
          <div className="flex justify-center">
            <img
              src={previewSrc}
              alt="Selected thumbnail"
              className="max-h-32 rounded-lg object-contain shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailSelector;

