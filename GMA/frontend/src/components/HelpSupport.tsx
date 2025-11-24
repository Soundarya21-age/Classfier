import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Mail,
  Youtube,
  FileText,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from './ui/accordion';

interface HelpSupportProps {
  onBack: () => void;
}

export function HelpSupport({ onBack }: HelpSupportProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const resources = [
    {
      title: 'Documentation',
      description: 'Complete guide to using GMA Classifier',
      icon: BookOpen,
      gradient: 'from-[#00D9FF] to-[#0099FF]',
      action: () => alert('Opening documentation...'),
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Youtube,
      gradient: 'from-red-500 to-red-600',
      action: () => alert('Opening video tutorials...'),
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: Mail,
      gradient: 'from-purple-500 to-purple-600',
      action: () => alert('Opening support form...'),
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: MessageSquare,
      gradient: 'from-green-500 to-green-600',
      action: () => alert('Opening community forum...'),
    },
  ];

  const faqs = [
    {
      question: 'How do I upload a video for classification?',
      answer: 'Navigate to the "Video Upload" section from the dashboard, click the upload area, select your video file, and click "Start Classification". Supported formats include MP4, AVI, MOV, and WMV.',
    },
    {
      question: 'What is a Blind Test?',
      answer: 'A Blind Test allows you to classify multiple videos from your library without seeing their names or metadata during the process. This helps ensure unbiased classification results.',
    },
    {
      question: 'How long does video classification take?',
      answer: 'Processing time varies based on video length and quality. On average, a 2-minute video takes approximately 30-60 seconds to process. You can track progress in the "Manage Uploads" section.',
    },
    {
      question: 'What do the risk levels mean?',
      answer: 'High Risk: Content requires immediate review. Uncertain: Content needs manual verification. Low Risk: Content is likely safe for distribution. Each classification includes a confidence score.',
    },
    {
      question: 'Can I retest a video?',
      answer: 'Yes! In the "Manage Uploads" section, click the three-dot menu next to any processed video and select "Re-test" to run the classification again.',
    },
    {
      question: 'How do I download classification reports?',
      answer: 'After a test is complete, navigate to "History" or click on a processed video in "Manage Uploads", then click the "Download Report" button to export results as a PDF.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'GMA Classifier supports MP4, AVI, MOV, WMV, and FLV video formats. Maximum file size is 500MB per video.',
    },
    {
      question: 'Can I batch process multiple videos?',
      answer: 'Yes! Use the "Full Blind Test" feature to select multiple videos from your library and process them all at once.',
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl md:text-3xl">Help & Support</h2>
              <p className="text-gray-400">Find answers and get assistance</p>
            </div>
          </div>
        </motion.div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {resources.map((resource, index) => (
            <motion.button
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={resource.action}
              className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all hover:scale-[1.02] text-left group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <resource.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white mb-2">{resource.title}</h3>
              <p className="text-gray-400 text-sm">{resource.description}</p>
            </motion.button>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1F2937]/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-[#00D9FF]" />
            <h3 className="text-white text-xl">Frequently Asked Questions</h3>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-[#0F1419] border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-12 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
            />
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#0F1419] border border-gray-800 rounded-xl px-4 data-[state=open]:border-gray-700"
              >
                <AccordionTrigger className="text-white hover:text-[#00D9FF] transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No FAQs found matching your search.</p>
            </div>
          )}
        </motion.div>

        {/* Contact Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-br from-[#00D9FF]/10 to-[#0099FF]/10 rounded-2xl p-6 border border-[#00D9FF]/30"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white mb-2">Still need help?</h3>
              <p className="text-gray-400">Our support team is here to assist you</p>
            </div>
            <button
              onClick={() => alert('Opening contact form...')}
              className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#00D9FF]/30 flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
