/**
 * List of available thumbnail images in the public/assets folder
 * These can be selected when creating or editing videos
 */
export const AVAILABLE_THUMBNAILS = [
  { filename: 'music-player.png', label: 'Music' },
  { filename: 'game-controller.png', label: 'Gaming' },
  { filename: 'soccer.png', label: 'Sports' },
  { filename: 'video-player.png', label: 'Video' },
];

/**
 * Get the full path for a thumbnail asset
 */
export const getThumbnailPath = (filename) => {
  return `/assets/${filename}`;
};
