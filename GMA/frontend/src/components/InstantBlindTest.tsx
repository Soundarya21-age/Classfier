import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload as UploadIcon, Play, X, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

interface InstantBlindTestProps {
  onBack: () => void;
  onComplete: (videoCount?: number, testId?: number) => void;
}

interface UploadedVideo {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  backendId?: number;
}

export function InstantBlindTest({ onBack, onComplete }: InstantBlindTestProps) {
  const { currentUser } = useAuth();
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [testRunning, setTestRunning] = useState(false);

  const MAX_VIDEOS = 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    const remainingSlots = MAX_VIDEOS - uploadedVideos.length;
    const filesToAdd = videoFiles.slice(0, remainingSlots);

    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    for (const file of filesToAdd) {
      const newVideo: UploadedVideo = {
        id: Math.random().toString(36).substring(7),
        file,
        status: 'uploading',
        progress: 0,
      };

      setUploadedVideos(prev => [...prev, newVideo]);

      try {
        const token = await currentUser.getIdToken();
        const formData = new FormData();
        formData.append('files', file);

        const response = await axios.post(
          'http://localhost:8000/api/uploads/',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              setUploadedVideos(prev =>
                prev.map(v =>
                  v.id === newVideo.id
                    ? { ...v, progress }
                    : v
                )
              );
            },
          }
        );

        const uploadedData = response.data[0];
        setUploadedVideos(prev =>
          prev.map(v =>
            v.id === newVideo.id
              ? { ...v, status: 'success', progress: 100, backendId: uploadedData.id }
              : v
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        toast.error(message);
        setUploadedVideos(prev =>
          prev.map(v =>
            v.id === newVideo.id
              ? { ...v, status: 'error', progress: 0 }
              : v
          )
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
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

  const successfulUploads = uploadedVideos.filter(v => v.status === 'success').length;
  const canStartTest = successfulUploads > 0;

  const handleStartTest = async () => {
    if (successfulUploads === 0) {
      toast.error('Please upload at least one video');
      return;
    }

    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setTestRunning(true);
      const token = await currentUser.getIdToken();
      const videoIds = uploadedVideos
        .filter(v => v.status === 'success' && v.backendId)
        .map(v => v.backendId!);

      const response = await fetch('http://localhost:8000/api/tests/instant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_type: 'instant',
          video_ids: videoIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create test: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success(`Instant test completed for ${videoIds.length} videos`);
      // Pass both videoCount and testId to onComplete
      onComplete(videoIds.length, result.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run test';
      toast.error(message);
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-[#1A1F25] via-[#0F1419] to-[#1A1F25] p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h2 className="text-white text-2xl md:text-3xl mb-2">Video Upload</h2>
          <p className="text-gray-400">Upload videos for classification (Max {MAX_VIDEOS} videos)</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-800"
        >
          {/* Upload Area */}
          {uploadedVideos.length < MAX_VIDEOS && (
            <div className="mb-6">
              <Label className="text-gray-300 mb-3 block">Upload Videos</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all ${
                  isDragging
                    ? 'border-[#00D9FF] bg-[#00D9FF]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white mb-2">Drop your videos here</h3>
                  <p className="text-gray-400 text-sm mb-4">or</p>
                  <label htmlFor="file-upload">
                    <span className="inline-block px-6 py-2 bg-[#00D9FF]/20 text-[#00D9FF] rounded-lg cursor-pointer hover:bg-[#00D9FF]/30 transition-colors">
                      Browse Files
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-xs mt-4">
                    Supports: MP4 (Max 500MB per file) • {uploadedVideos.length}/{MAX_VIDEOS} videos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Videos List */}
          {uploadedVideos.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-gray-300">
                  Uploaded Videos ({uploadedVideos.length}/{MAX_VIDEOS})
                </Label>
                {successfulUploads > 0 && (
                  <span className="text-green-400 text-sm">
                    {successfulUploads} successfully uploaded
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {uploadedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="bg-[#0F1419] rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {getStatusIcon(video.status)}
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-white truncate">{video.file.name}</p>
                            {getStatusBadge(video.status)}
                          </div>
                          
                          {/* Progress Bar */}
                          {video.status === 'uploading' && (
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${video.progress}%` }}
                                className="h-full bg-gradient-to-r from-[#00D9FF] to-[#0099FF]"
                              />
                            </div>
                          )}
                          
                          {video.status === 'success' && (
                            <p className="text-gray-400 text-sm">
                              {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeVideo(video.id)}
                          className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Start Test Button */}
          <Button
            disabled={!canStartTest || testRunning}
            onClick={handleStartTest}
            className="w-full bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl h-12 shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testRunning ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Test ({successfulUploads} video{successfulUploads !== 1 ? 's' : ''})
              </>
            )}
          </Button>

          <p className="text-gray-500 text-xs text-center mt-4">
            The test will begin immediately after clicking start
          </p>
        </motion.div>
      </div>
    </div>
  );
}