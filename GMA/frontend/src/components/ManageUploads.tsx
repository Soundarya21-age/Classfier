import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Trash2,
  Download,
  Eye,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  FileVideo,
  AlertCircle,
  Loader,
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface ManageUploadsProps {
  onBack: () => void;
  onInstantBlindTest?: () => void;
}

interface Video {
  id: number;
  filename: string;
  original_filename: string;
  file_url?: string;
  url?: string;
  file_size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  created_at: string;
  classification?: 'high-risk' | 'uncertain' | 'low-risk';
  confidence?: number;
}

export function ManageUploads({ onBack, onInstantBlindTest }: ManageUploadsProps) {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoDurations, setVideoDurations] = useState<{ [key: number]: number }>({});

  // ✅ Fetch videos from backend
  useEffect(() => {
    const fetchVideos = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch('http://localhost:8000/api/uploads/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentUser]);

  // ✅ Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ✅ Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  // ✅ Format duration (seconds to MM:SS)
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Handle video duration loaded
  const handleDurationLoad = (videoId: number, duration: number) => {
    setVideoDurations(prev => ({
      ...prev,
      [videoId]: duration
    }));
  };

  // ✅ Handle video download
  const handleDownloadVideo = async (video: Video) => {
    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      
      // Use the backend download endpoint
      const response = await fetch(
        `http://localhost:8000/api/uploads/${video.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = video.original_filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup the URL object
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded: ${video.original_filename}`);
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Failed to download video');
    }
  };

  // ✅ Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-blue-500/20 text-blue-400">Uploaded</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400">Error</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  // ✅ Get classification badge
  const getClassificationBadge = (classification?: string) => {
    switch (classification) {
      case 'high-risk':
        return <Badge className="bg-red-500/20 text-red-400">High Risk</Badge>;
      case 'uncertain':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Uncertain</Badge>;
      case 'low-risk':
        return <Badge className="bg-green-500/20 text-green-400">Low Risk</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Not Classified</Badge>;
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVideoSelection = (id: number) => {
    setSelectedVideos((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map((v) => v.id));
    }
  };

  // ✅ Delete video
  const handleDeleteSingle = async (id: number) => {
    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:8000/api/uploads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  // ManageUploads.tsx (Modified handleDeleteSelected for robustness)

  const handleDeleteSelected = async () => {
    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      
      // Use map to create an array of promises, but catch individual errors
      const deletePromises = selectedVideos.map((id) =>
          fetch(`http://localhost:8000/api/uploads/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(response => {
            if (!response.ok) {
                // If deletion failed on backend, throw an error with ID
                throw new Error(`Failed to delete ID ${id}`);
            }
            return id; // Return the successfully deleted ID
          }).catch(error => {
            console.error(error.message);
            // Return null or a sentinel value instead of re-throwing, 
            // so Promise.all completes.
            return null; 
          })
      );
      
      const results = await Promise.all(deletePromises);
      
      // Filter out null results (failed deletions) to get only successful IDs
      const successfulDeletions = results.filter((id): id is number => id !== null);

      // Update state to remove only the successfully deleted videos
      setVideos((prev) => 
        prev.filter((v) => !successfulDeletions.includes(v.id))
      );

      setSelectedVideos([]);
      setShowDeleteDialog(false);
      
      if (successfulDeletions.length > 0) {
        toast.success(`${successfulDeletions.length} video(s) deleted successfully`);
      } else {
        toast.error('No videos were deleted. Check console for details.');
      }

    } catch (error) {
      console.error('Error during batch deletion:', error);
      toast.error('An unexpected error occurred during batch deletion.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] dark:bg-[#1A1F25] bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 dark:text-white text-gray-900">
          <Loader className="w-5 h-5 animate-spin" />
          Loading videos...
        </div>
      </div>
    );
  }

 return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-[#1A1F25] via-[#0F1419] to-[#1A1F25] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-white text-2xl md:text-3xl mb-2">Manage Uploads</h2>
              <p className="text-gray-400">
                {videos.length} total videos • {selectedVideos.length} selected
              </p>
            </div>

            {/* Batch Actions */}
            <AnimatePresence>
              {selectedVideos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-2"
                >
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedVideos.length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-[#0F1419] border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-12 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
            />
          </div>
        </motion.div>

        {/* Videos List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-[#0F1419] p-4 border-b border-gray-800">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex items-center justify-center">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {selectedVideos.length === filteredVideos.length && filteredVideos.length > 0 ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="col-span-5 text-gray-400 text-sm">Video Name</div>
              <div className="col-span-2 text-gray-400 text-sm hidden md:block text-center">Upload Date</div>
              <div className="col-span-2 text-gray-400 text-sm hidden lg:block text-center">Duration</div>
              <div className="col-span-2 text-gray-400 text-sm text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-800">
            {filteredVideos.length === 0 ? (
              <div className="p-12 text-center">
                <FileVideo className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No videos found</p>
              </div>
            ) : (
              filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => toggleVideoSelection(video.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {selectedVideos.includes(video.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#00D9FF]" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Video Name */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          {video.file_url || video.url ? (
                            <div className="w-full h-full">
                              <ReactPlayer
                                url={video.file_url || video.url}
                                width="100%"
                                height="100%"
                                controls={false}
                                light={true}
                                playing={false}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00D9FF]/20 to-[#0099FF]/20">
                              <FileVideo className="w-5 h-5 text-[#00D9FF]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm truncate max-w-[250px]">
                            {video.original_filename}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatFileSize(video.file_size)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 hidden md:block text-center">
                      <p className="text-gray-400 text-sm">{formatDate(video.created_at)}</p>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 hidden lg:block text-center">
                      <p className="text-gray-400 text-sm">{formatDuration(videoDurations[video.id] || 0)}</p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 inline-flex items-center justify-center rounded-md bg-transparent hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#1F2937] border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => setSelectedVideo(video)}
                            className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={onInstantBlindTest}
                            className="text-[#00D9FF] hover:bg-[#00D9FF]/10 hover:text-[#00D9FF] cursor-pointer"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Instant Blind Test
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadVideo(video)}
                            className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Video
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSingle(video.id)}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Video Details Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="bg-[#1F2937] border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Video Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about the selected video
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Info */}
              <div className="bg-[#0F1419] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                    {selectedVideo?.file_url || selectedVideo?.url ? (
                      <div className="w-full h-full">
                        <ReactPlayer
                          url={selectedVideo?.file_url || selectedVideo?.url}
                          width="100%"
                          height="100%"
                          controls={false}
                          playing={false}
                          light={true}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00D9FF] to-[#0099FF]">
                        <FileVideo className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white">{selectedVideo.original_filename}</p>
                    <p className="text-gray-400 text-sm">Video File</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Upload Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#00D9FF]" />
                      <p className="text-white text-sm">{formatDate(selectedVideo.created_at)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#00D9FF]" />
                      <p className="text-white text-sm">{selectedVideo ? formatDuration(videoDurations[selectedVideo.id] || 0) : '--:--'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">File Size</p>
                    <p className="text-white text-sm">{formatFileSize(selectedVideo.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    {getStatusBadge(selectedVideo.status)}
                  </div>
                </div>
              </div>

              {/* Classification Results */}
              {selectedVideo.classification && (
                <div className="bg-[#0F1419] rounded-xl p-4">
                  <h4 className="text-white mb-4">Classification Results</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Risk Level</span>
                      {getClassificationBadge(selectedVideo.classification)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Confidence Score</span>
                      <span className="text-white">{selectedVideo.confidence}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                  onClick={() => setSelectedVideo(null)}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedVideo) handleDownloadVideo(selectedVideo);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1F2937] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Delete Videos
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedVideos.length} video(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSelected}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden ReactPlayer instances to capture video durations */}
      <div style={{ display: 'none' }}>
        {videos.map((video) => (
          <ReactPlayer
            key={`duration-${video.id}`}
            url={`http://localhost:8000/uploads/${video.filename}`}
            onDuration={(duration) => handleDurationLoad(video.id, duration)}
            progressInterval={0}
          />
        ))}
      </div>
    </div>
  );
}
