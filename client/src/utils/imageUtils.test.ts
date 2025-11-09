import { getImageUrl, getImageUrlWithFallback } from './imageUtils';

describe('imageUtils', () => {
  describe('getImageUrl', () => {
    it('should return empty string for null or undefined input', () => {
      expect(getImageUrl(null)).toBe('');
      expect(getImageUrl(undefined)).toBe('');
    });

    it('should return Cloudinary URLs as-is', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg';
      expect(getImageUrl(cloudinaryUrl)).toBe(cloudinaryUrl);
    });

    it('should return HTTPS URLs as-is', () => {
      const httpsUrl = 'https://example.com/image.jpg';
      expect(getImageUrl(httpsUrl)).toBe(httpsUrl);
    });

    it('should return HTTP URLs as-is', () => {
      const httpUrl = 'http://example.com/image.jpg';
      expect(getImageUrl(httpUrl)).toBe(httpUrl);
    });

    it('should construct full URL for paths starting with /uploads/', () => {
      const originalEnv = import.meta.env.VITE_API_URL;
      import.meta.env.VITE_API_URL = 'http://localhost:11001';
      
      const uploadPath = '/uploads/image.jpg';
      expect(getImageUrl(uploadPath)).toBe('http://localhost:11001/uploads/image.jpg');
      
      // Restore original env
      import.meta.env.VITE_API_URL = originalEnv;
    });

    it('should construct full URL for relative paths without /uploads/', () => {
      const originalEnv = import.meta.env.VITE_API_URL;
      import.meta.env.VITE_API_URL = 'http://localhost:11001';
      
      const relativePath = 'image.jpg';
      expect(getImageUrl(relativePath)).toBe('http://localhost:11001/uploads/image.jpg');
      
      // Restore original env
      import.meta.env.VITE_API_URL = originalEnv;
    });

    it('should handle paths with trailing slashes in API URL', () => {
      const originalEnv = import.meta.env.VITE_API_URL;
      import.meta.env.VITE_API_URL = 'http://localhost:11001/';
      
      const uploadPath = '/uploads/image.jpg';
      expect(getImageUrl(uploadPath)).toBe('http://localhost:11001/uploads/image.jpg');
      
      // Restore original env
      import.meta.env.VITE_API_URL = originalEnv;
    });
  });

  describe('getImageUrlWithFallback', () => {
    it('should return fallback for null or undefined input', () => {
      expect(getImageUrlWithFallback(null, 'fallback.jpg')).toBe('fallback.jpg');
      expect(getImageUrlWithFallback(undefined, 'fallback.jpg')).toBe('fallback.jpg');
    });

    it('should return fallback when no input and no fallback provided', () => {
      expect(getImageUrlWithFallback(null)).toBe('');
      expect(getImageUrlWithFallback(undefined)).toBe('');
    });

    it('should return processed URL for valid input', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg';
      expect(getImageUrlWithFallback(cloudinaryUrl, 'fallback.jpg')).toBe(cloudinaryUrl);
    });
  });
});