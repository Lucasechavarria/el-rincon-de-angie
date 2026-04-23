/* eslint-disable import/first */
import React from 'react';
import { motion, AnimatePresence as AnimatePresenceOriginal } from 'framer-motion';
const AnimatePresence = AnimatePresenceOriginal as any;
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    // @ts-ignore - Framer Motion type definition issue with React 18
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg pointer-events-auto"
            >
              <GlassCard noHover className="border-white/20 shadow-2xl relative overflow-visible">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-[#1B4D3E] text-black dark:text-white rounded-full flex items-center justify-center shadow-xl z-10 hover:rotate-90 transition-transform"
                >
                  <X size={20} />
                </button>

                <div className="p-8 md:p-10">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gradient-gold">
                    {title}
                  </h3>
                  {children}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
