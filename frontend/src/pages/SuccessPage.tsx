import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Mail, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import SEOHead from '../components/seo/SEOHead';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import { useGlobalStore } from '../stores/useGlobalStore';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useGlobalStore();
  const paymentId = searchParams.get('payment_id');
  const isGuest = !localStorage.getItem('token');

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <AnimatedPage>
      <SEOHead title="¡Gracias por tu compra!" description="Tu pago ha sido procesado exitosamente." />
      
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[80vh]">
        <GlassCard noHover className="max-w-2xl w-full p-10 md:p-16 text-center border-white/20 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#1B4D3E]/20 rounded-full blur-3xl"></div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, 0] }}
            transition={{ type: 'spring', duration: 1 }}
            className="w-24 h-24 bg-[#D4AF37] text-[#1B4D3E] rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[#D4AF37]/20"
          >
            <CheckCircle2 size={48} />
          </motion.div>

          <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-6 tracking-tight`}>
            ¡Pago Confirmado!
          </h2>
          
          <p className={`${textSecondary} text-lg mb-12 font-light leading-relaxed`}>
            Gracias por apoyar el arte de Angie. Tu transacción <span className="text-[#D4AF37] font-medium">#{paymentId || 'N/A'}</span> se ha completado con éxito.
          </p>

          <div className="space-y-6">
            {isGuest ? (
              <GlassCard noHover className="bg-white/5 border-white/5 p-8">
                <Mail className="mx-auto mb-4 text-[#D4AF37]" size={32} />
                <h4 className={`font-bold ${textPrimary} mb-2`}>Revisa tu Email</h4>
                <p className="text-sm text-white/60 font-light">
                  Hemos enviado un correo electrónico con el link de descarga y tu recibo. Si no lo ves, revisa tu carpeta de Spam.
                </p>
              </GlassCard>
            ) : (
              <GlassCard noHover className="bg-white/5 border-white/5 p-8">
                <BookOpen className="mx-auto mb-4 text-[#D4AF37]" size={32} />
                <h4 className={`font-bold ${textPrimary} mb-2`}>Libro disponible en Biblioteca</h4>
                <p className="text-sm text-white/60 font-light">
                  Ya puedes encontrar tu nueva historia en tu biblioteca personal para leerla en cualquier momento.
                </p>
              </GlassCard>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
              <PremiumButton 
                variant={isGuest ? "secondary" : "primary"}
                onClick={() => navigate(isGuest ? '/libros' : '/mis-libros')}
              >
                {isGuest ? 'Seguir Explorando' : 'Ir a Mi Biblioteca'}
                <ArrowRight size={18} />
              </PremiumButton>
              
              {isGuest && (
                <button 
                  onClick={() => navigate('/login')}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-white/50 hover:text-[#D4AF37] transition-colors"
                >
                  Registrarse para guardar compras
                </button>
              )}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/20">
            <Sparkles size={12} />
            Historias que tocan el corazón
          </div>
        </GlassCard>
      </div>
    </AnimatedPage>
  );
};

export default SuccessPage;
