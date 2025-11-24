import { useAuth } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
import { initializeAPI } from './services/api-service';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BlindTestSelection } from './components/BlindTestSelection';
import { BlindTestSetup } from './components/BlindTestSetup';
import { InstantBlindTest } from './components/InstantBlindTest';
import { VideoUpload } from './components/VideoUpload';
import { UploadProgress } from './components/UploadProgress';
import { ResultsHistory } from './components/ResultsHistory';
import { ClassificationResults } from './components/ClassificationResults';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { ManageUploads } from './components/ManageUploads';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { HelpSupport } from './components/HelpSupport';
import { ThemeProvider } from './components/ThemeContext';

type Screen = 'dashboard' | 'blind-test-selection' | 'full-blind-test' | 'instant-blind-test' | 'video-upload' | 'results' | 'history' | 'manage' | 'profile' | 'settings' | 'analytics' | 'help' | 'classification-results';

export default function App() {
  // ✅ FIXED: Use Firebase auth instead of local state
  const { currentUser, loading: authLoading, logout, getAuthToken } = useAuth();

  // ✅ Initialize API when user logs in
  useEffect(() => {
    if (currentUser) {
      initializeAPI(getAuthToken);
    }
  }, [currentUser, getAuthToken]);

  // UI State
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedVideoCount, setSelectedVideoCount] = useState(0);
  const [selectedTestDate, setSelectedTestDate] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  // Upload progress state
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'success' | 'error'>('uploading');

  // ✅ FIXED: Handle logout with error handling
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'blind-test') {
      setCurrentScreen('blind-test-selection');
    } else if (screen === 'upload') {
      setCurrentScreen('video-upload');
    } else {
      setCurrentScreen(screen as Screen);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleSelectBlindTest = (type: 'full' | 'instant') => {
    if (type === 'full') {
      setCurrentScreen('full-blind-test');
    } else {
      setCurrentScreen('instant-blind-test');
    }
  };

  const handleTestComplete = (videoCount?: number, testId?: number) => {
    if (videoCount !== undefined) {
      setSelectedVideoCount(videoCount);
    }
    if (testId !== undefined) {
      setSelectedTestId(testId);
    }
    setCurrentScreen('classification-results');
  };

  const handleViewTestDetails = (testDate: string, videoCount: number, testId?: number) => {
    setSelectedTestDate(testDate);
    setSelectedVideoCount(videoCount);
    if (testId !== undefined) {
      setSelectedTestId(testId);
    }
    setCurrentScreen('classification-results');
  };

  const handleUploadStart = (files: File[]) => {
    setUploadingFiles(files);
    setCurrentFileIndex(0);
    setUploadProgress(0);
    setUploadStatus('uploading');
    setShowUploadProgress(true);

    // Simulate upload process
    simulateUpload(files, 0);
  };

  const simulateUpload = (files: File[], fileIndex: number) => {
    if (fileIndex >= files.length) {
      setUploadStatus('success');
      return;
    }

    setCurrentFileIndex(fileIndex);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        // Move to next file after a short delay
        setTimeout(() => {
          simulateUpload(files, fileIndex + 1);
        }, 500);
      }
    }, 300);
  };

  const handleUploadComplete = () => {
    setShowUploadProgress(false);
    setUploadingFiles([]);
    setCurrentFileIndex(0);
    setUploadProgress(0);
  };

  // ✅ FIXED: Show loading state while checking auth
  if (authLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  // ✅ FIXED: Show login page if not authenticated
  if (!currentUser) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // ✅ User is authenticated - show main app
  return (
    <ThemeProvider>
      <div className="size-full min-h-screen dark:bg-[#1A1F25] bg-white">
        <Header onLogout={handleLogout} onNavigate={handleNavigate} />

        {currentScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}

        {currentScreen === 'blind-test-selection' && (
          <BlindTestSelection onBack={handleBackToDashboard} onSelectTest={handleSelectBlindTest} />
        )}

        {currentScreen === 'full-blind-test' && (
          <BlindTestSetup onBack={handleBackToDashboard} onComplete={handleTestComplete} />
        )}

        {currentScreen === 'instant-blind-test' && (
          <InstantBlindTest onBack={handleBackToDashboard} onComplete={handleTestComplete} />
        )}

        {currentScreen === 'video-upload' && (
          <VideoUpload onBack={handleBackToDashboard} onUploadStart={handleUploadStart} />
        )}

        {currentScreen === 'classification-results' && (
          <ClassificationResults
            onBack={() => setCurrentScreen('history')}
            testId={selectedTestId}
            videosProcessed={selectedVideoCount}
            testDate={selectedTestDate}
          />
        )}

        {currentScreen === 'history' && (
          <ResultsHistory onBack={handleBackToDashboard} onViewDetails={handleViewTestDetails} />
        )}

        {currentScreen === 'profile' && <ProfilePage onBack={handleBackToDashboard} />}

        {currentScreen === 'settings' && <SettingsPage onBack={handleBackToDashboard} />}

        {currentScreen === 'manage' && (
          <ManageUploads
            onBack={handleBackToDashboard}
            onInstantBlindTest={() => setCurrentScreen('instant-blind-test')}
          />
        )}

        {currentScreen === 'analytics' && <AnalyticsDashboard onBack={handleBackToDashboard} />}

        {currentScreen === 'help' && <HelpSupport onBack={handleBackToDashboard} />}

        {/* Upload Progress Modal */}
        {showUploadProgress && (
          <UploadProgress
            files={uploadingFiles}
            currentFileIndex={currentFileIndex}
            progress={uploadProgress}
            status={uploadStatus}
            onComplete={handleUploadComplete}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
