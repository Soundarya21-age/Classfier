import { uploadAPI } from './api-service';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Validate file
export const validateVideoFile = (file: File): string | null => {
  // FIX: Allow both .mov and .mp4 files
  if (!file.name.toLowerCase().endsWith('.mov') && !file.name.toLowerCase().endsWith('.mp4')) {
    return 'Only .mov or .mp4 files are supported'; // Updated message
  }

  const maxSize = 1.5 * 1024 * 1024 * 1024; // 1.5GB
  if (file.size > maxSize) {
    return `File size must be less than 1.5GB. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
  }

  return null;
};

// ... (rest of the file remains the same)

// Upload videos with progress tracking
export const uploadVideosWithProgress = async (
  files: File[],
  onProgress: (progress: UploadProgress[]) => void
) => {
  const progressArray: UploadProgress[] = files.map(f => ({
    fileName: f.name,
    progress: 0,
    status: 'pending',
  }));

  try {
    onProgress(progressArray.map(p => ({ ...p, status: 'uploading' })));
    const response = await uploadAPI.uploadVideos(files);

    onProgress(progressArray.map((p, i) => ({
      ...p,
      progress: 100,
      status: 'success',
    })));

    return response;
  } catch (error: any) {
    onProgress(progressArray.map(p => ({
      ...p,
      status: 'error',
      error: error.message,
    })));
    throw error;
  }
};
