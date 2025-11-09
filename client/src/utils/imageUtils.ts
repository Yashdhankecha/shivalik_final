/**
 * Utility function to construct proper image URLs for uploaded images
 * Handles Cloudinary URLs (https://res.cloudinary.com/...), relative paths (/uploads/...), and full URLs
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // If it's already a full URL (http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /uploads/, construct the full URL using API base URL
  if (imagePath.startsWith('/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:11001';
    // Remove trailing slash from API URL if present
    const baseUrl = apiUrl.replace(/\/$/, '');
    return `${baseUrl}${imagePath}`;
  }

  // If it's a relative path without /uploads/, assume it's in uploads folder
  if (!imagePath.startsWith('/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:11001';
    const baseUrl = apiUrl.replace(/\/$/, '');
    return `${baseUrl}/uploads/${imagePath}`;
  }

  // For other relative paths, prepend API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:11001';
  const baseUrl = apiUrl.replace(/\/$/, '');
  return `${baseUrl}${imagePath}`;
};

/**
 * Get image URL with fallback to placeholder
 */
export const getImageUrlWithFallback = (
  imagePath: string | null | undefined,
  fallback?: string
): string => {
  if (!imagePath) {
    return fallback || '';
  }
  return getImageUrl(imagePath);
};

