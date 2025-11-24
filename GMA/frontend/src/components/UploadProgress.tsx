import { motion } from 'motion/react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';

interface UploadProgressProps {
  files: File[];
  currentFileIndex: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  onComplete: () => void;
}

export function UploadProgress({ 
  files, 
  currentFileIndex, 
  progress, 
  status,
  onComplete 
}: UploadProgressProps) {
  const currentFile = files[currentFileIndex];
  const totalFiles = files.length;
  const overallProgress = ((currentFileIndex * 100) + progress) / totalFiles;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="dark:bg-[#1F2937] bg-white rounded-2xl border dark:border-gray-800 border-gray-200 p-8 max-w-lg w-full"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {status === 'uploading' && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center">
              <Upload className="w-10 h-10 text-white" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="dark:text-white text-gray-900 text-2xl text-center mb-2">
          {status === 'uploading' && 'Uploading Videos...'}
          {status === 'success' && 'Upload Complete!'}
          {status === 'error' && 'Upload Failed'}
        </h3>

        {/* File Info */}
        {currentFile && status === 'uploading' && (
          <p className="dark:text-gray-400 text-gray-600 text-center mb-6">
            Uploading {currentFileIndex + 1} of {totalFiles}: {currentFile.name}
          </p>
        )}

        {status === 'success' && (
          <p className="dark:text-gray-400 text-gray-600 text-center mb-6">
            Successfully uploaded {totalFiles} video{totalFiles !== 1 ? 's' : ''}
          </p>
        )}

        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="dark:text-gray-400 text-gray-600 text-sm">Current File Progress</span>
              <span className="dark:text-white text-gray-900 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 mb-4" />

            <div className="flex justify-between items-center mb-2">
              <span className="dark:text-gray-400 text-gray-600 text-sm">Overall Progress</span>
              <span className="dark:text-white text-gray-900 font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        )}

        {/* File List */}
        <div className="space-y-2 max-h-48 overflow-y-auto mb-6">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === currentFileIndex
                  ? 'dark:bg-[#00D9FF]/10 bg-blue-50 dark:border-[#00D9FF]/30 border-blue-200 border'
                  : 'dark:bg-[#0F1419] bg-gray-50 dark:border-gray-800 border-gray-200 border'
              }`}
            >
              {index < currentFileIndex && (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
              {index === currentFileIndex && status === 'uploading' && (
                <div className="w-4 h-4 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {index > currentFileIndex && (
                <div className="w-4 h-4 rounded-full dark:border-gray-700 border-gray-300 border-2 flex-shrink-0" />
              )}
              <span className={`text-sm truncate ${
                index <= currentFileIndex 
                  ? 'dark:text-white text-gray-900' 
                  : 'dark:text-gray-500 text-gray-400'
              }`}>
                {file.name}
              </span>
            </div>
          ))}
        </div>

        {/* Complete Button */}
        {status === 'success' && (
          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl h-12 transition-all duration-200 hover:scale-[1.02]"
          >
            Continue
          </button>
        )}

        {/* Processing Message */}
        {status === 'uploading' && (
          <p className="dark:text-gray-500 text-gray-400 text-xs text-center">
            Please wait while your videos are being uploaded...
          </p>
        )}
      </motion.div>
    </div>
  );
}
