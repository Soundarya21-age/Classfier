import { motion } from 'motion/react';
import { ArrowLeft, Eye, Calendar, Video, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface TestResult {
  id: number;
  test_type: string;
  uploaded_at: string;
  status: string;
  results?: string; // JSON string with classification results
}

interface ResultsHistoryProps {
  onBack: () => void;
  onViewDetails?: (testDate: string, videoCount: number, testId?: number) => void;
}

export function ResultsHistory({ onBack, onViewDetails }: ResultsHistoryProps) {
  const { currentUser } = useAuth();
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse results and calculate statistics
  const parseResults = (resultsJson?: string) => {
    if (!resultsJson) {
      return { videosProcessed: 0, highRisk: 0, uncertain: 0, lowRisk: 0 };
    }
    try {
      const parsed = JSON.parse(resultsJson);
      if (Array.isArray(parsed)) {
        const stats = { videosProcessed: parsed.length, highRisk: 0, uncertain: 0, lowRisk: 0 };
        parsed.forEach((item: any) => {
          const score = item.final_result || item.confidence || 0;
          if (score >= 70) stats.highRisk++;
          else if (score >= 40) stats.uncertain++;
          else stats.lowRisk++;
        });
        return stats;
      }
      return { videosProcessed: 0, highRisk: 0, uncertain: 0, lowRisk: 0 };
    } catch {
      return { videosProcessed: 0, highRisk: 0, uncertain: 0, lowRisk: 0 };
    }
  };

  // Helper function to format date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Helper function to calculate duration (placeholder)
  const calculateDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    if (!currentUser) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchTestHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await currentUser.getIdToken();
        console.log('Token received:', token ? 'YES (length: ' + token.length + ')' : 'NO');
        
        const response = await fetch('http://localhost:8000/api/tests/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Failed to fetch test history: ${response.statusText}`);
        }

        const data = await response.json();
        setTestHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch test history';
        console.error('Fetch error:', err);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, [currentUser]);

  // Calculate overall statistics
  const totalVideosAnalyzed = testHistory.reduce((sum, test) => {
    const stats = parseResults(test.results);
    return sum + stats.videosProcessed;
  }, 0);

  const latestTest = testHistory.length > 0 ? testHistory[0] : null;
  const latestDateTime = latestTest ? formatDateTime(latestTest.uploaded_at) : null;

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
              <h2 className="text-white text-2xl md:text-3xl mb-2">Test History</h2>
              <p className="text-gray-400">View all completed classification tests</p>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader className="w-8 h-8 text-[#00D9FF] animate-spin mb-4" />
            <p className="text-gray-400">Loading test history...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400"
          >
            <p>Error loading test history: {error}</p>
          </motion.div>
        )}

        {/* Stats Summary */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Tests</p>
                  <Video className="w-4 h-4 text-[#00D9FF]" />
                </div>
                <p className="text-white text-2xl">{testHistory.length}</p>
                <p className="text-gray-500 text-xs mt-1">Completed successfully</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Videos Analyzed</p>
                  <Video className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-white text-2xl">{totalVideosAnalyzed}</p>
                <p className="text-gray-500 text-xs mt-1">Total processed</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Latest Test</p>
                  <Calendar className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-white text-2xl">{latestDateTime?.date || 'N/A'}</p>
                <p className="text-gray-500 text-xs mt-1">{latestDateTime?.time || 'No tests'}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Test History Table */}
        {!loading && !error && testHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">Test Type</TableHead>
                        <TableHead className="text-gray-400 text-center">Date</TableHead>
                        <TableHead className="text-gray-400 text-center">Videos</TableHead>
                        <TableHead className="text-gray-400 text-center">Status</TableHead>
                        <TableHead className="text-gray-400 text-center">Results Summary</TableHead>
                        <TableHead className="text-gray-400 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testHistory.map((test, index) => {
                        const stats = parseResults(test.results);
                        const dateTime = formatDateTime(test.uploaded_at);
                        const testName = `${test.test_type === 'instant' ? 'Instant' : 'Full'} Blind Test`;
                        
                        return (
                          <motion.tr
                            key={test.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-gray-800 hover:bg-gray-800/30 transition-colors"
                          >
                            <TableCell className="text-white">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D9FF]/20 to-[#0099FF]/20 flex items-center justify-center">
                                  <Video className="w-5 h-5 text-[#00D9FF]" />
                                </div>
                                <div>
                                  <p className="text-white">{testName}</p>
                                  <p className="text-gray-500 text-xs">{dateTime.time}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300 text-center">{dateTime.date}</TableCell>
                            <TableCell className="text-gray-300 text-center">{stats.videosProcessed}</TableCell>
                            <TableCell className="text-gray-300 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                test.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                test.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {test.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                  {stats.highRisk} High
                                </span>
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                                  {stats.uncertain} Unc.
                                </span>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                  {stats.lowRisk} Low
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                onClick={() => onViewDetails?.(dateTime.date, stats.videosProcessed, test.id)}
                                variant="outline"
                                size="sm"
                                className="border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF]/10 hover:border-[#00D9FF] rounded-lg"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-800">
                  {testHistory.map((test, index) => {
                    const stats = parseResults(test.results);
                    const dateTime = formatDateTime(test.uploaded_at);
                    const testName = `${test.test_type === 'instant' ? 'Instant' : 'Full'} Blind Test`;
                    
                    return (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D9FF]/20 to-[#0099FF]/20 flex items-center justify-center flex-shrink-0">
                            <Video className="w-5 h-5 text-[#00D9FF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white mb-1">{testName}</p>
                            <p className="text-gray-400 text-sm">
                              {dateTime.date} • {dateTime.time}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Videos</p>
                            <p className="text-gray-300">{stats.videosProcessed}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Status</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                              test.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              test.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {test.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                            {stats.highRisk} High Risk
                          </span>
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                            {stats.uncertain} Uncertain
                          </span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                            {stats.lowRisk} Low Risk
                          </span>
                        </div>

                        <Button
                          onClick={() => onViewDetails?.(dateTime.date, stats.videosProcessed, test.id)}
                          variant="outline"
                          size="sm"
                          className="w-full border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF]/10 hover:border-[#00D9FF] rounded-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && testHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No test history found</p>
            <p className="text-gray-500 text-sm">Start by running a new classification test</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
