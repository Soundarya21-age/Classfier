import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Video, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', tests: 12, highRisk: 3, lowRisk: 7, uncertain: 2 },
    { day: 'Tue', tests: 19, highRisk: 5, lowRisk: 10, uncertain: 4 },
    { day: 'Wed', tests: 15, highRisk: 2, lowRisk: 11, uncertain: 2 },
    { day: 'Thu', tests: 22, highRisk: 6, lowRisk: 12, uncertain: 4 },
    { day: 'Fri', tests: 18, highRisk: 4, lowRisk: 10, uncertain: 4 },
    { day: 'Sat', tests: 8, highRisk: 1, lowRisk: 6, uncertain: 1 },
    { day: 'Sun', tests: 10, highRisk: 2, lowRisk: 7, uncertain: 1 },
  ];

  const classificationData = [
    { name: 'Low Risk', value: 63, color: '#10B981' },
    { name: 'Uncertain', value: 18, color: '#F59E0B' },
    { name: 'High Risk', value: 19, color: '#EF4444' },
  ];

  const processingTimeData = [
    { range: '0-1m', count: 45 },
    { range: '1-2m', count: 78 },
    { range: '2-3m', count: 52 },
    { range: '3-4m', count: 34 },
    { range: '4-5m', count: 18 },
    { range: '5m+', count: 12 },
  ];

  const stats = [
    {
      title: 'Total Tests',
      value: '247',
      change: '+12.5%',
      trend: 'up',
      icon: Video,
      gradient: 'from-[#00D9FF] to-[#0099FF]',
    },
    {
      title: 'High Risk Detected',
      value: '47',
      change: '-8.3%',
      trend: 'down',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
    },
    {
      title: 'Low Risk',
      value: '156',
      change: '+15.2%',
      trend: 'up',
      icon: CheckCircle2,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Avg Processing Time',
      value: '2.4m',
      change: '-5.1%',
      trend: 'down',
      icon: Clock,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl md:text-3xl">Analytics Dashboard</h2>
              <p className="text-gray-400">Last 7 days performance overview</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-white text-3xl">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Tests Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-white mb-6">Weekly Test Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tests" 
                  stroke="#00D9FF" 
                  strokeWidth={2}
                  name="Total Tests"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Classification Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-white mb-6">Classification Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Classification Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-white mb-6">Risk Classification Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="lowRisk" stackId="a" fill="#10B981" name="Low Risk" />
                <Bar dataKey="uncertain" stackId="a" fill="#F59E0B" name="Uncertain" />
                <Bar dataKey="highRisk" stackId="a" fill="#EF4444" name="High Risk" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Processing Time Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-white mb-6">Processing Time Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#9D5FFF" name="Videos" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
