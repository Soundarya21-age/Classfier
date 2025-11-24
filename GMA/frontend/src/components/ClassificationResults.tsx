import { motion } from 'motion/react';
import { ArrowLeft, Download, Loader, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface ClassificationResult {
  video_id: number;
  video_filename: string;
  math_classifier: number;
  dl_classifier: number;
  final_result: number;
  status: 'high-risk' | 'uncertain' | 'low-risk';
}

interface TestData {
  id: number;
  test_type: string;
  uploaded_at: string;
  status: string;
  results?: string;
  video_ids?: string;
}

interface ClassificationResultsProps {
  onBack: () => void;
  testDate?: string;
  videosProcessed?: number;
  testId?: number; // New: pass test ID to fetch real data
}

export function ClassificationResults({ onBack, testDate, videosProcessed, testId }: ClassificationResultsProps) {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !testId) {
      // If no testId, show empty/error state
      setLoading(false);
      return;
    }

    const fetchTestResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await currentUser.getIdToken();

        // Fetch the specific test from /api/tests/history
        // Since we don't have a /api/tests/{id} endpoint, we fetch history and find our test
        const response = await fetch('http://localhost:8000/api/tests/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch test history');
        }

        const allTests: TestData[] = await response.json();
        const test = allTests.find(t => t.id === testId);

        if (!test) {
          throw new Error('Test not found');
        }

        setTestData(test);

        // Parse results from JSON string
        if (test.results) {
          const parsedResults = JSON.parse(test.results);
          setResults(Array.isArray(parsedResults) ? parsedResults : []);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch test results';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [currentUser, testId]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'high-risk':
        return {
          label: 'High Risk',
          className: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      case 'uncertain':
        return {
          label: 'Uncertain',
          className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        };
      case 'low-risk':
        return {
          label: 'Low Risk',
          className: 'bg-green-500/20 text-green-400 border-green-500/30',
        };
      case 'error':
        return {
          label: 'Video Error',
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };
    }
  };

  const handleDownloadReport = () => {
    if (results.length === 0) {
      toast.error('No results to download');
      return;
    }

    const reportContent = `GMA CLASSIFIER - CLASSIFICATION REPORT\n================================================\n\nTest Details:\n-------------\nTest Type: ${testData?.test_type || 'Unknown'}\nDate: ${testDate || new Date().toLocaleDateString()}\nVideos Processed: ${results.length}\n\nClassification Results:\n----------------------\n${results
      .map((result, index) => `\n${index + 1}. ${result.video_filename}\n   Math Classifier: ${result.math_classifier}%\n   DL Classifier: ${result.dl_classifier}%\n   Final Result: ${result.final_result}%\n   Status: ${getStatusConfig(result.status).label}\n`)
      .join('')}\nSummary:\n--------\nHigh Risk: ${results.filter((r) => r.status === 'high-risk').length}\nUncertain: ${results.filter((r) => r.status === 'uncertain').length}\nLow Risk: ${results.filter((r) => r.status === 'low-risk').length}\n\n================================================\nReport Generated: ${new Date().toLocaleString()}\n`;

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const lines = doc.splitTextToSize(reportContent, pageWidth);
      doc.setFontSize(11);
      doc.text(lines, margin, 40);

      const fileName = `GMA_Classification_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Failed to generate PDF report', err);
      toast.error('Failed to generate PDF');
    }
  };

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
            Back to History
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-white text-2xl md:text-3xl mb-2">Classification Results</h2>
              <p className="text-gray-400">Per video classification details</p>
            </div>
            {!loading && !error && results.length > 0 && (
              <Button 
                onClick={handleDownloadReport}
                className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
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
            <p className="text-gray-400">Loading classification results...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400"
          >
            <p>Error loading results: {error}</p>
          </motion.div>
        )}

        {/* Results View */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                          <TableHead className="text-gray-400 w-1/4">Video</TableHead>
                          <TableHead className="text-gray-400 w-1/4 text-center">Math Classifier</TableHead>
                          <TableHead className="text-gray-400 w-1/4 text-center">DL Classifier</TableHead>
                          <TableHead className="text-gray-400 w-1/4 text-center">Final Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result, index) => {
                          const statusConfig = getStatusConfig(result.status);
                          return (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-gray-800 hover:bg-gray-800/30 transition-colors"
                            >
                              <TableCell className="text-white">{result.video_filename}</TableCell>
                              <TableCell className="text-gray-300 text-center">{result.math_classifier}%</TableCell>
                              <TableCell className="text-gray-300 text-center">{result.dl_classifier}%</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-3">
                                  <span className="text-white min-w-[3rem] text-center">{result.final_result}%</span>
                                  <Badge
                                    variant="outline"
                                    className={`rounded-lg ${statusConfig.className} min-w-[7rem] justify-center`}
                                  >
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    {results.map((result, index) => {
                      const statusConfig = getStatusConfig(result.status);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 border-b border-gray-800"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-white">{result.video_filename}</p>
                            <Badge
                              variant="outline"
                              className={`rounded-lg ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Math</p>
                              <p className="text-gray-300">{result.math_classifier}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">DL</p>
                              <p className="text-gray-300">{result.dl_classifier}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Final</p>
                              <p className="text-white">{result.final_result}%</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Test Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card className="bg-[#0F1419] border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-gray-400 text-sm mb-1">Test Type</p>
                      <p className="text-white">{testData?.test_type || 'Unknown'}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0F1419] border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-gray-400 text-sm mb-1">Date</p>
                      <p className="text-white">{testDate || new Date().toLocaleDateString()}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0F1419] border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-gray-400 text-sm mb-1">Videos Processed</p>
                      <p className="text-white">{results.length}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0F1419] border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-gray-400 text-sm mb-1">High Risk</p>
                      <p className="text-red-400">{results.filter((r) => r.status === 'high-risk').length}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0F1419] border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-gray-400 text-sm mb-1">Uncertain</p>
                      <p className="text-orange-400">{results.filter((r) => r.status === 'uncertain').length}</p>
                    </CardContent>
                  </Card>

                  {/* Status Legend */}
                  <div className="pt-6 border-t border-gray-800">
                    <p className="text-gray-400 text-sm mb-3">Status Legend</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-300 text-sm">High Risk (≥70%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-gray-300 text-sm">Uncertain (40-70%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-300 text-sm">Low Risk ({'<40%'})</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <AlertCircle className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400">No results available for this test</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
