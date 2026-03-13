import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.svg';

const Loading = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // small delay after 100%
          return 100;
        }
        return prev + (100 / 70); // 7 seconds, 70 intervals of 100ms
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="loading-container">
      <motion.img
        src={logo}
        alt="G.R.O.A Logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        style={{ width: '200px', height: 'auto' }}
      />
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--text-primary)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;