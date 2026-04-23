import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Book as BookIcon, Download, LampDesk, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import SEOHead from '../components/seo/SEOHead';
import { useGlobalStore } from '../stores/useGlobalStore';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import { staggerContainer } from '../utils/animations';

interface PurchasedBook {
  id: number;
  title: string;
  cover_image_url: string | null;
  purchase_date: string;
}

const LibraryPage: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchasedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useGlobalStore();

  useEffect(() => {
    const fetchLibrary = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      try {
        // This endpoint will be created in the next backend turn
        const response = await axios.get('http://localhost:8000/users/me/library', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(response.data);
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const handleDownload = async (bookId: number) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/books/${bookId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      alert('Error al descargar el libro. Por favor intenta de nuevo.');
    }
  };

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <AnimatedPage>
      <SEOHead title="Mis Libros" description="Tu colección personal de historias." />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={14} />
            Tu Colección Privada
          </motion.div>
          <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-4 tracking-tight`}>
            Mis Libros
          </h2>
          <p className={`${textSecondary} text-lg max-w-2xl mx-auto font-light`}>
            Bienvenido a tu rincón personal. Aquí encontrarás todas las historias que has adquirido.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
          </div>
        ) : purchases.length === 0 ? (
          <GlassCard noHover className="text-center py-32 border-white/5">
            <BookOpen size={64} className="mx-auto mb-6 text-white/10" />
            <h3 className={`text-2xl font-bold ${textPrimary} mb-4`}>Aún no tienes libros</h3>
            <p className={`${textSecondary} mb-8 max-w-md mx-auto`}>
              Tu biblioteca está esperando ser llenada con historias increíbles.
            </p>
            <PremiumButton onClick={() => window.location.href = '/libros'}>
              Explorar Catálogo
            </PremiumButton>
          </GlassCard>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {purchases.map((book) => (
              <GlassCard key={book.id} className="group">
                <div className="aspect-[2/3] relative overflow-hidden bg-black/40">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-20">
                      <BookIcon size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6">
                    <PremiumButton 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownload(book.id)}
                    >
                      <Download size={18} />
                      Descargar
                    </PremiumButton>
                    <PremiumButton variant="glass" size="sm" className="w-full">
                      <LampDesk size={18} />
                      Leer Online
                    </PremiumButton>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`font-bold ${textPrimary} truncate mb-1`}>{book.title}</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">
                    Adquirido el {new Date(book.purchase_date).toLocaleDateString()}
                  </p>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default LibraryPage;
