import { motion } from 'motion/react';
import { Upload, FolderOpen, History, FlaskConical, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const tiles = [
    {
      id: 'upload',
      title: 'Video Upload',
      description: 'Upload new videos for classification',
      icon: Upload,
      gradient: 'from-[#00D9FF] to-[#0099FF]',
    },
    {
      id: 'manage',
      title: 'Manage Uploads',
      description: 'View and organize your videos',
      icon: FolderOpen,
      gradient: 'from-[#0099FF] to-[#6B5FFF]',
    },
    {
      id: 'history',
      title: 'History',
      description: 'View classification results',
      icon: History,
      gradient: 'from-[#6B5FFF] to-[#9D5FFF]',
    },
    {
      id: 'blind-test',
      title: 'Blind Test',
      description: 'Run full blind test on videos',
      icon: FlaskConical,
      gradient: 'from-[#9D5FFF] to-[#FF5FBF]',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View performance insights and trends',
      icon: BarChart3,
      gradient: 'from-[#FF5FBF] to-[#FF5F5F]',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-[#1A1F25] via-[#0F1419] to-[#1A1F25] p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-white text-2xl md:text-3xl mb-2">Welcome Back!</h2>
          <p className="text-gray-400">Select an option to get started with video classification</p>
        </motion.div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {tiles.map((tile, index) => (
            <motion.button
              key={tile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate(tile.id)}
              className="group relative bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] text-left overflow-hidden"
            >
              {/* Gradient Background (on hover) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${tile.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <tile.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>

                <h3 className="text-white text-xl md:text-2xl mb-2">{tile.title}</h3>
                <p className="text-gray-400">{tile.description}</p>

                {/* Arrow Icon */}
                <div className="mt-4 flex items-center gap-2 text-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm">Get Started</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          <Card className="bg-[#1F2937]/30 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all cursor-pointer" onClick={() => onNavigate('manage')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total Videos</p>
                <FolderOpen className="w-4 h-4 text-[#00D9FF]" />
              </div>
              <p className="text-white text-2xl">247</p>
              <p className="text-gray-500 text-xs mt-1">Click to manage</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1F2937]/30 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all cursor-pointer" onClick={() => onNavigate('history')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Completed Tests</p>
                <History className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white text-2xl">89</p>
              <p className="text-gray-500 text-xs mt-1">View results</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1F2937]/30 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all cursor-pointer" onClick={() => onNavigate('analytics')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Avg. Duration</p>
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-white text-2xl">2.5 min</p>
              <p className="text-gray-500 text-xs mt-1">View analytics</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}