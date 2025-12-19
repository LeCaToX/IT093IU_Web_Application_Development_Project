/**
 * Helper function to get the correct image source URL.
 * Handles both external URLs (http/https) and local asset filenames.
 * 
 * @param {string} thumbnailUrl - The thumbnail URL or filename
 * @param {string} assetPrefix - The prefix for local assets (default: '/assets/')
 * @returns {string} - The resolved image source URL
 */
export const getImageSrc = (thumbnailUrl, assetPrefix = '/assets/') => {
  if (!thumbnailUrl) {
    return `${assetPrefix}placeholder.png`;
  }
  // If it's already a full URL, use it directly
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
    return thumbnailUrl;
  }
  // If it already starts with / (absolute path), use it directly
  if (thumbnailUrl.startsWith('/')) {
    return thumbnailUrl;
  }
  // Otherwise, treat it as a local asset filename
  return `${assetPrefix}${thumbnailUrl}`;
};

