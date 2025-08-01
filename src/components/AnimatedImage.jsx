import { motion } from 'framer-motion';

export default function AnimatedImage({ src, alt, className }) {
  return (
    <motion.div
      className="overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <img 
        src={src} 
        alt={alt} 
        className={`transition-transform duration-500 ${className}`} 
      />
    </motion.div>
  );
} 