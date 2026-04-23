import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Star, Coffee, Feather, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { staggerContainer, floatAnimation, reveal } from '../utils/animations';
import SEOHead from '../components/seo/SEOHead';
import StructuredData from '../components/seo/StructuredData';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import { useGlobalStore } from '../stores/useGlobalStore';
import PremiumButton from '../components/ui/PremiumButton';
import GlassCard from '../components/ui/GlassCard';

const HomePage: React.FC = () => {
  const { theme } = useGlobalStore();
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);
  
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-[#2C3E50]';

  return (
    <AnimatedPage>
      <SEOHead
        title="El Rincón de Angie - Historias que Tocan el Corazón"
        description="Descubre historias cautivadoras de romance, drama y emociones. Lee las obras de Angie y sumérgete en mundos llenos de pasión y sentimientos."
        url="http://localhost:3000"
        type="website"
      />
      <StructuredData
        type="Organization"
        data={{
          name: "El Rincón de Angie",
          url: "http://localhost:3000",
          logo: "http://localhost:3000/logo-512.png",
          description: "Historias que tocan el corazón",
          founderName: "Angie"
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto relative px-4"
      >
        {/* Cinematic Hero Section */}
        <motion.section 
          style={{ opacity: opacityHero, y: y1 }}
          className="min-h-[80vh] flex flex-col items-center justify-center text-center relative overflow-hidden pt-10"
        >
          {/* Decorative Animated Elements */}
          <motion.div
            variants={floatAnimation}
            animate="animate"
            className={`absolute top-0 left-0 ${theme === 'dark' ? 'text-[#D4AF37]/10' : 'text-[#D4AF37]/20'} -z-10`}
          >
            <Feather size={200} />
          </motion.div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute bottom-20 right-0 ${theme === 'dark' ? 'text-[#1B4D3E]/10' : 'text-[#1B4D3E]/5'} -z-10`}
          >
            <Sparkles size={150} />
          </motion.div>

          <motion.div variants={reveal} className="mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/20 to-transparent blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <img
              src="/El rincon de Angie3.png"
              alt="El Rincón de Angie"
              className={`w-full max-w-4xl h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:scale-[1.02] ${theme === 'dark' ? 'brightness-110 contrast-105' : ''}`}
            />
          </motion.div>

          <motion.p 
            variants={reveal}
            className={`text-xl md:text-3xl ${textSecondary} mb-12 max-w-3xl mx-auto font-['Outfit'] font-light tracking-wide leading-relaxed`}
          >
            Donde las palabras se convierten en <span className="text-[#D4AF37] font-medium italic">sentimientos</span> y cada página cuenta un secreto.
          </motion.p>

          <motion.div variants={reveal}>
            <Link to="/libros">
              <PremiumButton size="lg">
                <BookOpen size={28} className="group-hover:rotate-12 transition-transform duration-300" />
                Explorar Biblioteca
              </PremiumButton>
            </Link>
          </motion.div>
        </motion.section>

        {/* Premium Features Grid */}
        <motion.section 
          variants={staggerContainer} 
          className="grid md:grid-cols-3 gap-10 mb-32 relative z-10"
        >
          {[
            {
              icon: Star,
              title: "Narrativa Única",
              desc: "Historias tejidas con la delicadeza de quien escribe desde el alma.",
              link: "/historias"
            },
            {
              icon: BookOpen,
              title: "Experiencia Premium",
              desc: "Un lector digital diseñado para sumergirte en la historia sin distracciones.",
              link: "/libros"
            },
            {
              icon: Coffee,
              title: "Apoya el Arte",
              desc: "Contribuye a que nuevas voces y leyendas sigan cobrando vida.",
              link: "https://link.mercadopago.com.ar/elrincondeangie",
              external: true
            }
          ].map((feature, index) => (
            <GlassCard
              key={index}
              onClick={() => feature.external ? window.open(feature.link, '_blank') : window.location.href = feature.link}
              className="p-10 text-center group cursor-pointer"
            >
              <div className={`w-20 h-20 ${theme === 'dark' ? 'bg-white/5' : 'bg-[#F5F5DC]'} rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-3 transition-transform duration-500 mx-auto`}>
                <feature.icon className={theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#1B4D3E]'} size={40} />
              </div>
              <h3 className={`text-2xl font-bold ${textPrimary} mb-4 group-hover:text-[#D4AF37] transition-colors duration-300`}>{feature.title}</h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed text-lg font-light`}>{feature.desc}</p>
            </GlassCard>
          ))}
        </motion.section>

        {/* Newsletter / CTA Section */}
        <motion.section 
          variants={reveal}
          className={`relative overflow-hidden p-16 rounded-[3rem] shadow-2xl text-white text-center mb-20 ${theme === 'dark' ? 'bg-[#0A0A0A] border border-white/5' : 'bg-[#1B4D3E]'}`}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/pinstripe.png')]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#1B4D3E]/40 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <motion.h3 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-4xl md:text-5xl font-bold mb-6 text-gradient-gold"
            >
              Próximamente
            </motion.h3>
            <p className="text-xl italic opacity-80 mb-10 max-w-2xl mx-auto font-light">
              "El susurro del viento", una nueva historia corta que te dejará sin aliento.
            </p>
            <PremiumButton variant="secondary">
              Suscribirse a Novedades
            </PremiumButton>
          </div>
        </motion.section>
      </motion.div>
    </AnimatedPage>
  );
};

export default HomePage;
