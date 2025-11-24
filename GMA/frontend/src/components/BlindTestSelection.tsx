import { motion } from 'motion/react';
import { ArrowLeft, FlaskConical, Upload } from 'lucide-react';

interface BlindTestSelectionProps {
  onBack: () => void;
  onSelectTest: (type: 'full' | 'instant') => void;
}

export function BlindTestSelection({ onBack, onSelectTest }: BlindTestSelectionProps) {
  const options = [
    {
      id: 'full',
      title: 'Full Blind Test',
      description: 'Select multiple videos from your library for batch classification',
      icon: FlaskConical,
      gradient: 'from-[#00D9FF] to-[#0099FF]',
    },
    {
      id: 'instant',
      title: 'Instant Blind Test',
      description: 'Upload a single video for immediate classification',
      icon: Upload,
      gradient: 'from-[#9D5FFF] to-[#FF5FBF]',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-[#1A1F25] via-[#0F1419] to-[#1A1F25] p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h2 className="text-white text-2xl md:text-3xl mb-2">Blind Test</h2>
          <p className="text-gray-400">Choose your test type</p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectTest(option.id as 'full' | 'instant')}
              className="group relative bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] text-left overflow-hidden"
            >
              {/* Gradient Background (on hover) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-white text-xl mb-2">{option.title}</h3>
                <p className="text-gray-400 mb-4">{option.description}</p>

                {/* Arrow Icon */}
                <div className="flex items-center gap-2 text-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm">Select</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
