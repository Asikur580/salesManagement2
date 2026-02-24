export const API_BASE_URL = "/api";
export const STORAGE_URL = "/storage";

// Construct storage URL for images
export const getStorageUrl = (path?: string) => {
  if (!path) return undefined;
  return `${STORAGE_URL}/${path}`;
};
