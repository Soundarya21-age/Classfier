import axios from 'axios';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload as UploadIcon, X, CheckCircle2, AlertCircle, Calendar, Clock, FileVideo } from 'lucide-react';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext'; // ✅ Import auth

interface VideoUploadProps {
  onBack: () => void;
  onUploadStart?: (files: File[]) => void;
}

interface UploadedVideo {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  uploadDate?: string;
  errorMessage?: string;
}

export function VideoUpload({ onBack, onUploadStart }: VideoUploadProps) {
  const { currentUser } = useAuth(); // ✅ Get current user
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_VIDEOS = 10;
  const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5GB in bytes
  const ALLOWED_TYPES = ['video/mp4', 'video/quicktime']; // .mov and .mp4

  // ✅ Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only MP4 and MOV files are supported';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 1.5GB. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
      if (onUploadStart) {
        onUploadStart(files);
      }
    }
  };

  const handleFiles = async (files: File[]) => {
    // ✅ Validate file count
    const remainingSlots = MAX_VIDEOS - uploadedVideos.length;
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more video(s)`);
      return;
    }

    // ✅ Validate and add files
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      const newVideo: UploadedVideo = {
        id: Math.random().toString(36).substring(7),
        file,
        status: 'uploading',
        progress: 0,
      };

      setUploadedVideos(prev => [...prev, newVideo]);

      // ✅ Upload to backend
      await uploadToBackend(newVideo);
    }
  };

  // ✅ FIXED: Upload to backend API with proper progress tracking
const uploadToBackend = async (video: UploadedVideo) => {
  try {
    if (!currentUser) {
      throw new Error('User not authenticated. Please log in and try again.');
    }

    // Get auth token
    const token = await currentUser.getIdToken();

    // Create FormData
    const formData = new FormData();
    formData.append('files', video.file);

    // Upload with progress tracking
    const response = await axios.post(
      'http://localhost:8000/api/uploads/',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadedVideos(prev =>
              prev.map(v =>
                v.id === video.id ? { ...v, progress: percentCompleted } : v
              )
            );
          }
        },
      }
    );

    // Mark as successful and capture backend ID
    const uploadedVideo = Array.isArray(response.data) ? response.data[0] : response.data;
    const backendId = uploadedVideo?.id;

    setUploadedVideos(prev =>
      prev.map(v =>
        v.id === video.id
          ? { 
              ...v, 
              status: 'success', 
              progress: 100, 
              uploadDate: new Date().toISOString().split('T')[0],
              backendId: backendId
            }
          : v
      )
    );

    console.log('Upload successful:', response.data, 'Backend ID:', backendId);
  } catch (error: any) {
    console.error('Upload failed:', error);

    let errorMessage = 'Upload failed';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.detail || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server. Check if backend is running on http://localhost:8000';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }
    
    // Mark as error
    setUploadedVideos(prev =>
      prev.map(v =>
        v.id === video.id
          ? { 
              ...v, 
              status: 'error', 
              progress: 0,
              errorMessage
            }
          : v
      )
    );
  }
};

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
      if (onUploadStart) {
        onUploadStart(files);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeVideo = (id: string) => {
    setUploadedVideos(prev => prev.filter(v => v.id !== id));
  };

  // ✅ Retry failed upload
  const retryUpload = async (id: string) => {
    const video = uploadedVideos.find(v => v.id === id);
    if (video) {
      setUploadedVideos(prev =>
        prev.map(v => (v.id === id ? { ...v, status: 'uploading', progress: 0 } : v))
      );
      await uploadToBackend(video);
    }
  };

  const getStatusIcon = (status: UploadedVideo['status']) => {
    if (status === 'success') {
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    } else if (status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    } else {
      return (
        <div className="w-5 h-5 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
      );
    }
  };

  const getStatusBadge = (status: UploadedVideo['status']) => {
    if (status === 'success') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 rounded-lg border">Uploaded</Badge>;
    } else if (status === 'error') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 rounded-lg border">Failed</Badge>;
    } else {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 rounded-lg border">Uploading</Badge>;
    }
  };

  const successfulUploads = uploadedVideos.filter(v => v.status === 'success');
  const failedUploads = uploadedVideos.filter(v => v.status === 'error');

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br dark:from-[#1A1F25] dark:via-[#0F1419] dark:to-[#1A1F25] from-gray-50 via-white to-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="dark:text-white text-gray-900 text-2xl md:text-3xl mb-2">Video Upload</h2>
              <p className="dark:text-gray-400 text-gray-600">
                Upload and manage your videos • {uploadedVideos.length}/{MAX_VIDEOS} videos
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="dark:bg-[#1F2937]/50 bg-white backdrop-blur-xl rounded-2xl p-6 md:p-8 border dark:border-gray-800 border-gray-200">
              {uploadedVideos.length < MAX_VIDEOS && (
                <div className="mb-6">
                  <Label className="dark:text-gray-300 text-gray-700 mb-3 block">Upload Videos</Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all ${
                      isDragging
                        ? 'border-[#00D9FF] bg-[#00D9FF]/10'
                        : 'dark:border-gray-700 border-gray-300 dark:hover:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center">
                        <UploadIcon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="dark:text-white text-gray-900 mb-2">Drop your videos here</h3>
                      <p className="dark:text-gray-400 text-gray-600 text-sm mb-4">or</p>
                      <label htmlFor="file-upload">
                        <span className="inline-block px-6 py-2 bg-[#00D9FF]/20 text-[#00D9FF] rounded-lg cursor-pointer hover:bg-[#00D9FF]/30 transition-colors">
                          Browse Files
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".mp4,.mov,video/mp4,video/quicktime"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="dark:text-gray-500 text-gray-400 text-xs mt-4">
                        Supports: MP4, MOV (Max 1.5GB per file)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Videos List */}
              {uploadedVideos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="dark:text-gray-300 text-gray-700">
                      Uploaded Videos ({uploadedVideos.length}/{MAX_VIDEOS})
                    </Label>
                    {successfulUploads.length > 0 && (
                      <span className="text-green-400 text-sm">
                        {successfulUploads.length} successfully uploaded
                      </span>
                    )}
                    {failedUploads.length > 0 && (
                      <span className="text-red-400 text-sm">
                        {failedUploads.length} failed
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {uploadedVideos.map((video) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="dark:bg-[#0F1419] bg-gray-50 rounded-xl p-4 border dark:border-gray-800 border-gray-200"
                        >
                          <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {getStatusIcon(video.status)}
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="dark:text-white text-gray-900 truncate">{video.file.name}</p>
                                {getStatusBadge(video.status)}
                              </div>

                              {/* Progress Bar */}
                              {video.status === 'uploading' && (
                                <div className="w-full h-2 dark:bg-gray-700 bg-gray-300 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${video.progress}%` }}
                                    className="h-full bg-gradient-to-r from-[#00D9FF] to-[#0099FF]"
                                  />
                                </div>
                              )}

                              {/* ✅ NEW: Error message */}
                              {video.status === 'error' && (
                                <p className="dark:text-red-400 text-red-500 text-sm">{video.errorMessage}</p>
                              )}

                              {video.status === 'success' && (
                                <p className="dark:text-gray-400 text-gray-600 text-sm">
                                  {(video.file.size / (1024 * 1024)).toFixed(2)} MB • {video.uploadDate}
                                </p>
                              )}
                            </div>

                            {/* ✅ NEW: Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {video.status === 'error' && (
                                <button
                                  onClick={() => retryUpload(video.id)}
                                  className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors flex items-center justify-center"
                                  title="Retry upload"
                                >
                                  ↻
                                </button>
                              )}
                              <button
                                onClick={() => removeVideo(video.id)}
                                className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="dark:bg-[#1F2937]/50 bg-white backdrop-blur-xl rounded-2xl p-6 border dark:border-gray-800 border-gray-200 sticky top-24">
              <h3 className="dark:text-white text-gray-900 mb-6">Upload Statistics</h3>

              <div className="space-y-4">
                <div className="dark:bg-[#0F1419] bg-gray-50 rounded-xl p-4 border dark:border-gray-800 border-gray-200">
                  <p className="dark:text-gray-400 text-gray-600 text-sm mb-1">Total Uploads</p>
                  <p className="dark:text-white text-gray-900 text-2xl">{uploadedVideos.length}</p>
                </div>

                <div className="dark:bg-[#0F1419] bg-gray-50 rounded-xl p-4 border dark:border-gray-800 border-gray-200">
                  <p className="dark:text-gray-400 text-gray-600 text-sm mb-1">Successful</p>
                  <p className="dark:text-white text-gray-900 text-2xl text-green-400">{successfulUploads.length}</p>
                </div>

                {/* ✅ NEW: Failed uploads count */}
                {failedUploads.length > 0 && (
                  <div className="dark:bg-[#0F1419] bg-gray-50 rounded-xl p-4 border dark:border-gray-800 border-gray-200">
                    <p className="dark:text-gray-400 text-gray-600 text-sm mb-1">Failed</p>
                    <p className="dark:text-white text-gray-900 text-2xl text-red-400">{failedUploads.length}</p>
                  </div>
                )}

                <div className="dark:bg-[#0F1419] bg-gray-50 rounded-xl p-4 border dark:border-gray-800 border-gray-200">
                  <p className="dark:text-gray-400 text-gray-600 text-sm mb-1">Available Slots</p>
                  <p className="dark:text-white text-gray-900 text-2xl">{MAX_VIDEOS - uploadedVideos.length}</p>
                </div>
              </div>

              {/* Recent Uploads */}
              {successfulUploads.length > 0 && (
                <div className="mt-6">
                  <h4 className="dark:text-gray-300 text-gray-700 text-sm mb-3">Recent Uploads</h4>
                  <div className="space-y-2">
                    {successfulUploads.slice(0, 3).map((video) => (
                      <div key={video.id} className="dark:bg-[#0F1419] bg-gray-50 rounded-lg p-3 border dark:border-gray-800 border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileVideo className="w-4 h-4 text-[#00D9FF]" />
                          <p className="dark:text-white text-gray-900 text-sm truncate flex-1">{video.file.name}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs dark:text-gray-500 text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {video.uploadDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Just now
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
