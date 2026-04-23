import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface PremiumButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden font-bold uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 rounded-2xl";
  
  const variants = {
    primary: "bg-[#1B4D3E] text-[#F5F5DC] shadow-xl hover:shadow-2xl",
    secondary: "bg-[#D4AF37] text-[#1B4D3E] shadow-xl hover:shadow-2xl hover:bg-[#B8860B]",
    outline: "border-2 border-[#1B4D3E] text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white",
    glass: "glass-premium text-[#1B4D3E] dark:text-[#D4AF37] hover:bg-white/20"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-8 py-4 text-xs",
    lg: "px-12 py-5 text-sm"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      {children}
    </motion.button>
  );
};

export default PremiumButton;
