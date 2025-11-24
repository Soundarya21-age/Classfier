import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, ArrowUpDown, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BlindTestSetupProps {
  onBack: () => void;
  onComplete: (videoCount?: number, testId?: number) => void;
}

interface Video {
  id: number;
  original_filename: string;
  file_size: number;
  status: string;
}

export function BlindTestSetup({ onBack, onComplete }: BlindTestSetupProps) {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');
  const [loading, setLoading] = useState(true);
  const [testRunning, setTestRunning] = useState(false);

  // Fetch videos from backend
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        
        const response = await fetch('http://localhost:8000/api/uploads/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }

        const data = await response.json();
        setVideos(Array.isArray(data) ? data : []);
        
        // Auto-select first 5 videos
        if (Array.isArray(data)) {
          setSelectedVideos(data.slice(0, 5).map(v => v.id));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch videos';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentUser]);

  const toggleVideo = (videoId: number) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Sort videos based on selected criteria
  const sortedVideos = [...videos].sort((a, b) => {
    if (sortBy === 'name') {
      return a.original_filename.localeCompare(b.original_filename);
    } else {
      return a.file_size - b.file_size;
    }
  });

  const handleStartTest = async () => {
    if (selectedVideos.length === 0) {
      toast.error('Please select at least one video');
      return;
    }

    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setTestRunning(true);
      const token = await currentUser.getIdToken();
      
      const response = await fetch('http://localhost:8000/api/tests/full', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_type: 'full',
          video_ids: selectedVideos,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create test: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success(`Test completed for ${selectedVideos.length} videos`);
      // Pass both videoCount and testId to onComplete
      onComplete(selectedVideos.length, result.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run test';
      toast.error(message);
    } finally {
      setTestRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-[#1A1F25] via-[#0F1419] to-[#1A1F25] p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#00D9FF] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading videos...</p>
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
          <h2 className="text-white text-2xl md:text-3xl mb-2">Full Blind Test</h2>
          <p className="text-gray-400">Select videos to run classification test</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Selection List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white">Available Videos</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedVideos.length} of {videos.length} selected
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl text-sm h-9 px-3 border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1F2937] border-gray-700">
                      <DropdownMenuItem
                        onClick={() => setSortBy('name')}
                        className={`cursor-pointer ${
                          sortBy === 'name' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        Sort by Name
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortBy('size')}
                        className={`cursor-pointer ${
                          sortBy === 'size' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        Sort by Size
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {videos.length > 0 ? (
                  sortedVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleVideo(video.id)}
                      className="flex items-center gap-4 p-4 border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => toggleVideo(video.id)}
                        className="data-[state=checked]:bg-[#00D9FF] data-[state=checked]:border-[#00D9FF]"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{video.original_filename}</p>
                        <p className="text-gray-400 text-sm">Size: {formatFileSize(video.file_size)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                          {video.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No videos available. Upload videos first.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Configuration Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-white mb-6">Test Configuration</h3>

              <div className="space-y-4 mb-6">
                <div className="bg-[#0F1419] rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Videos Selected</p>
                  <p className="text-white text-2xl">{selectedVideos.length}</p>
                </div>

                <div className="bg-[#0F1419] rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Total Size</p>
                  <p className="text-white text-2xl">
                    {formatFileSize(
                      videos
                        .filter(v => selectedVideos.includes(v.id))
                        .reduce((sum, v) => sum + v.file_size, 0)
                    )}
                  </p>
                </div>

                <div className="bg-[#0F1419] rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Estimated Time</p>
                  <p className="text-white text-2xl">{selectedVideos.length * 2} min</p>
                </div>
              </div>

              <Button
                disabled={selectedVideos.length === 0 || testRunning}
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
                    Start Test
                  </>
                )}
              </Button>

              <p className="text-gray-500 text-xs text-center mt-4">
                Test will run and results will appear in history
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}