/* eslint-disable import/first */
import React, { useState } from 'react';
import { Mail, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence as AnimatePresenceOriginal } from 'framer-motion';
const AnimatePresence = AnimatePresenceOriginal as any;
import Modal from './Modal';
import PremiumButton from './PremiumButton';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  onLoginClick: () => void;
  bookTitle: string;
}

const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onLoginClick,
  bookTitle 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa un correo electrónico.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    onConfirm(email);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adquirir Obra">
      <div className="space-y-8 relative overflow-hidden">
        {/* Immersive background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
          className="space-y-8 relative z-10"
        >
          <motion.div variants={itemVariants}>
            <p className="text-white/70 font-light leading-relaxed mb-1 text-sm uppercase tracking-wider">
              Estás a punto de adquirir:
            </p>
            <div className="flex items-baseline gap-2">
              <Sparkles className="text-[#D4AF37]" size={16} />
              <p className="text-[#D4AF37] font-bold text-2xl italic tracking-tight">"{bookTitle}"</p>
            </div>
          </motion.div>

          {/* Guest Flow */}
          <motion.form 
            variants={itemVariants}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 ml-1">
                Correo de Entrega Digital
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-all duration-300" size={20} />
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.08] transition-all duration-500 shadow-inner"
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs ml-1 font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <PremiumButton type="submit" variant="secondary" className="w-full py-5 text-base group overflow-hidden relative">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continuar al Pago Seguro
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </PremiumButton>
            
            <div className="flex items-center justify-center gap-2 text-[9px] text-white/30 uppercase tracking-[0.15em] font-medium">
              <ShieldCheck size={12} className="text-emerald-500/50" />
              Transacción protegida por Mercado Pago
            </div>
          </motion.form>

          {/* Separator */}
          <motion.div variants={itemVariants} className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
              <span className="bg-[#0A0A0A] px-6 text-white/20">O PREFIERO</span>
            </div>
          </motion.div>

          {/* Login Flow */}
          <motion.div variants={itemVariants} className="text-center pb-2">
            <p className="text-white/40 text-xs mb-6 font-light max-w-[280px] mx-auto leading-relaxed">
              Inicia sesión para guardar esta obra permanentemente en tu biblioteca personal.
            </p>
            <button
              onClick={onLoginClick}
              className="group text-[#D4AF37] hover:text-white transition-all duration-300 text-xs font-bold flex items-center justify-center gap-3 mx-auto uppercase tracking-[0.2em] py-2 px-4 rounded-xl hover:bg-white/5"
            >
              <UserCheck size={18} className="group-hover:scale-110 transition-transform" />
              Acceder a mi Cuenta
            </button>
          </motion.div>
        </motion.div>
      </div>
    </Modal>
  );
};

export default GuestCheckoutModal;
