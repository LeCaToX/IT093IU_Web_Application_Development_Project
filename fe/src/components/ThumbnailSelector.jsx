import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_THUMBNAILS, getThumbnailPath } from '../utils/thumbnailAssets';
import { PhotoIcon, LinkIcon, CheckIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import axios from '../config/axios';

const ThumbnailSelector = ({ value, onChange }) => {
  const selectedThumbnail = AVAILABLE_THUMBNAILS.find(t =>
    value === getThumbnailPath(t.filename) || value === t.filename
  );

  const isCustomValue = value && !selectedThumbnail && (value.startsWith('http://') || value.startsWith('https://'));

  const [mode, setMode] = useState(isCustomValue ? 'custom' : 'existing');
  const [customUrl, setCustomUrl] = useState(isCustomValue ? value : '');

  // Upload state
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedPreview, setUploadedPreview] = useState(null);

  useEffect(() => {
    if (value && !selectedThumbnail && (value.startsWith('http://') || value.startsWith('https://'))) {
      setCustomUrl(value);
      setMode('custom');
    }
  }, [value, selectedThumbnail]);

  useEffect(() => {
    if (mode === 'custom' && customUrl) {
      onChange(customUrl);
    }
  }, [mode, customUrl, onChange]);

  const handleCustomUrlChange = (url) => {
    setCustomUrl(url);
    if (mode === 'custom') {
      onChange(url);
    }
  };

  const handleSelectExisting = (thumbnail) => {
    onChange(getThumbnailPath(thumbnail.filename));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/uploads/thumbnail', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const uploadedUrl = response.data.url;
      setUploadedPreview(uploadedUrl);
      onChange(uploadedUrl);
      toast.success('Thumbnail uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload thumbnail');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearUpload = () => {
    setUploadedPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${mode === 'existing'
            ? 'bg-nf-accent text-nf-bg shadow-lg shadow-nf-accent/20'
            : 'bg-nf-surface text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text'
            }`}
        >
          <PhotoIcon className="w-4 h-4" />
          Preset
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${mode === 'upload'
            ? 'bg-nf-accent text-nf-bg shadow-lg shadow-nf-accent/20'
            : 'bg-nf-surface text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text'
            }`}
        >
          <CloudArrowUpIcon className="w-4 h-4" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${mode === 'custom'
            ? 'bg-nf-accent text-nf-bg shadow-lg shadow-nf-accent/20'
            : 'bg-nf-surface text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text'
            }`}
        >
          <LinkIcon className="w-4 h-4" />
          URL
        </button>
      </div>

      {/* Mode Content */}
      <div className="bg-nf-bg rounded-xl p-4 border border-nf-border">
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
                    ? 'ring-2 ring-nf-accent scale-105 shadow-lg shadow-nf-accent/30'
                    : 'ring-1 ring-nf-border hover:ring-nf-accent/50 hover:scale-102'
                    }`}
                >
                  <img
                    src={getThumbnailPath(thumbnail.filename)}
                    alt={thumbnail.label}
                    className="w-full h-full object-contain bg-gray-800 p-2"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-nf-accent/20 flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-nf-accent drop-shadow-lg" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-nf-bg/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-nf-text truncate">{thumbnail.label}</span>
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
                className={`border-2 border-dashed border-nf-border rounded-lg p-8 text-center cursor-pointer
                  hover:border-nf-accent hover:bg-nf-accent/10 transition-all duration-200
                  ${isUploading ? 'pointer-events-none' : ''}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-nf-accent/20 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nf-accent"></div>
                    </div>
                    <p className="text-nf-text font-medium">Uploading... {uploadProgress}%</p>
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
                      <p className="text-nf-text font-medium">Click to upload thumbnail</p>
                      <p className="text-sm text-nf-text-muted">JPG, PNG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={uploadedPreview}
                  alt="Uploaded thumbnail"
                  className="w-full max-h-48 object-contain rounded-lg bg-nf-surface"
                />
                <button
                  type="button"
                  onClick={clearUpload}
                  className="absolute top-2 right-2 p-1 bg-nf-tertiary rounded-full hover:bg-nf-tertiary-hover transition-colors"
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
            <div className="bg-nf-accent/10 border border-nf-accent/20 rounded-lg p-3">
              <p className="text-xs text-nf-text-muted">
                📦 Images are uploaded to <span className="text-nf-accent font-medium">Cloudinary</span> for secure, fast delivery
              </p>
            </div>
          </div>
        )}

        {/* Custom URL Input */}
        {mode === 'custom' && (
          <div className="space-y-4">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => handleCustomUrlChange(e.target.value)}
              placeholder="Enter image URL (https://...)"
              className="nf-input"
            />
            {customUrl && (
              <div className="flex justify-center">
                <img
                  src={customUrl}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-contain border border-nf-border"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {previewSrc && (
        <div className="bg-nf-bg rounded-xl p-4 border border-nf-border">
          <p className="text-sm text-nf-text-muted mb-3">Selected Thumbnail:</p>
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
