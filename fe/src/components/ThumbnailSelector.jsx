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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
            mode === 'existing'
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
            mode === 'custom'
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
                  className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group ${
                    isSelected
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

