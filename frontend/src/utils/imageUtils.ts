export const getImageSrc = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return "/logo.png"; // Default image if path is not provided
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return import.meta.env.VITE_API_BASE_URL + imagePath;
};
