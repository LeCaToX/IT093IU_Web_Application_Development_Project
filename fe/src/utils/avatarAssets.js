/**
 * List of available avatar images in the public/assets folder
 * These can be selected as profile pictures
 */
export const AVAILABLE_AVATARS = [
  { filename: 'avatar.png', label: 'Default' },
  { filename: 'logo.png', label: 'Logo' },
];

/**
 * Get the full path for an avatar asset
 */
export const getAvatarPath = (filename) => {
  return `/assets/${filename}`;
};
