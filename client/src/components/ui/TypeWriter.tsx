import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export const TypeWriter = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  showCursor = true,
}: TypeWriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <motion.span
          className="inline-block w-2 h-5 bg-terminal-primary ml-1"
          animate={{ opacity: isComplete ? [1, 0] : 1 }}
          transition={{
            duration: 0.5,
            repeat: isComplete ? Infinity : 0,
            repeatType: 'reverse',
          }}
        />
      )}
    </span>
  );
};
