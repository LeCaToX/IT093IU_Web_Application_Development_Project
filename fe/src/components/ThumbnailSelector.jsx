import React, { useState, useEffect } from 'react';
import { AVAILABLE_THUMBNAILS, getThumbnailPath } from '../utils/thumbnailAssets';
import { PhotoIcon, LinkIcon, CheckIcon } from '@heroicons/react/24/solid';

const ThumbnailSelector = ({ value, onChange }) => {
  const [mode, setMode] = useState('existing'); // 'existing' | 'custom'
  const [customUrl, setCustomUrl] = useState('');

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

  // Get preview image source
  const getPreviewSrc = () => {
    if (mode === 'existing' && selectedThumbnail) {
      return getThumbnailPath(selectedThumbnail.filename);
    } else if (mode === 'custom' && customUrl) {
      return customUrl;
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
          onClick={() => setMode('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${mode === 'custom'
            ? 'bg-pm-purple text-white shadow-lg shadow-pm-purple/30'
            : 'bg-se-gray text-gray-300 hover:bg-pm-purple/50'
            }`}
        >
          <LinkIcon className="w-4 h-4" />
          Custom URL
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
                    className="w-full h-full object-cover"
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
      {previewSrc && (
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
