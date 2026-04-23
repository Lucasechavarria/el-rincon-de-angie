import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeIn } from '../../utils/animations';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  noHover = false,
  ...props 
}) => {
  return (
    <motion.div
      variants={fadeIn}
      whileHover={noHover ? {} : { y: -10, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      className={`glass-premium rounded-[2.5rem] border border-white/10 overflow-hidden transition-all duration-500 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
