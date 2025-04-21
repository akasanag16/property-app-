
import { toast } from "sonner";

export const validateImage = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error("Only image files are allowed");
    return false;
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error("Image is too large. Maximum size is 5MB.");
    return false;
  }
  
  return true;
};

export const validateImages = (files: File[]) => {
  const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
  if (invalidFiles.length > 0) {
    toast.error("Only image files are allowed");
    return false;
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  const oversizedFiles = files.filter(file => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    toast.error(`Some images are too large. Maximum size is 5MB per image.`);
    return false;
  }
  
  return true;
};
