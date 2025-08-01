import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Info, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Alert = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Allow time for exit animation before calling onClose
    setTimeout(onClose, 300);
  };

  const alertConfig = {
    success: {
      icon: <Check size={24} />,
      bgColor: 'bg-green-500',
      mascot: '🎉',
    },
    error: {
      icon: <X size={24} />,
      bgColor: 'bg-red-500',
      mascot: '😥',
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      bgColor: 'bg-yellow-500',
      mascot: '🤔',
    },
    info: {
      icon: <Info size={24} />,
      bgColor: 'bg-blue-500',
      mascot: '👋',
    },
  };

  const { icon, bgColor, mascot } = alertConfig[type] || alertConfig.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 z-50"
        >
          <div className="flex items-center gap-4 bg-white rounded-2xl shadow-2xl p-4 w-80 border-l-4 border-green-500"
            style={{ borderLeftColor: alertConfig[type]?.bgColor.replace('bg-', '#') }}
          >
            <div className={`text-4xl`}>{mascot}</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 capitalize">{type}</p>
              <p className="text-gray-600">{message}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert; 