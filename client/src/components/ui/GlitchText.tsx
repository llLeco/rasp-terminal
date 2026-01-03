import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText = ({ text, className = '' }: GlitchTextProps) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="relative z-10 text-glow">{text}</span>
      <motion.span
        className="absolute top-0 left-0 text-terminal-error opacity-70"
        style={{ clipPath: 'inset(0 0 50% 0)' }}
        animate={{
          x: [0, -2, 2, -1, 0],
          opacity: [0.7, 0.5, 0.7, 0.6, 0.7],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute top-0 left-0 text-cyan-400 opacity-70"
        style={{ clipPath: 'inset(50% 0 0 0)' }}
        animate={{
          x: [0, 2, -2, 1, 0],
          opacity: [0.7, 0.6, 0.7, 0.5, 0.7],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
          delay: 0.1,
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
};
