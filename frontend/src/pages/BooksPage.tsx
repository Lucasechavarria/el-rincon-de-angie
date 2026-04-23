/* eslint-disable import/first */
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Book as BookIcon, Eye, Sparkles, ShoppingBag, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence as AnimatePresenceOriginal } from 'framer-motion';
const AnimatePresence = AnimatePresenceOriginal as any;
import SearchBar from '../components/search/SearchBar';
import CategoryFilter from '../components/search/CategoryFilter';
import SortDropdown from '../components/search/SortDropdown';
import SEOHead from '../components/seo/SEOHead';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import { useGlobalStore } from '../stores/useGlobalStore';
import { staggerContainer } from '../utils/animations';
import PremiumButton from '../components/ui/PremiumButton';
import GlassCard from '../components/ui/GlassCard';
import GuestCheckoutModal from '../components/ui/GuestCheckoutModal';

interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  cover_image_url: string | null;
  preview_percentage: number;
}

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Checkout States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedBookForCheckout, setSelectedBookForCheckout] = useState<Book | null>(null);

  const navigate = useNavigate();
  const { theme } = useGlobalStore();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory.toString());
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const endpoint = searchQuery || selectedCategory
        ? `http://localhost:8000/books/search?${params.toString()}`
        : 'http://localhost:8000/books/';

      const response = await axios.get(endpoint, { timeout: 5000 });
      setBooks(response.data);
    } catch (error) {
      console.error('[BooksPage] Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handlePurchaseClick = (book: Book) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
      // Guest flow: Show modal
      setSelectedBookForCheckout(book);
      setIsCheckoutModalOpen(true);
    } else {
      // Auth flow: Direct checkout
      processCheckout(book.id);
    }
  };

  const processCheckout = async (bookId: number, guestEmail?: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const payload = guestEmail ? { guest_email: guestEmail } : {};

      const response = await axios.post(`http://localhost:8000/payments/checkout/${bookId}`, payload, {
        headers
      });

      if (response.data && response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error: any) {
      console.error('[BooksPage] Error starting purchase:', error);
      alert(`Error al iniciar la compra: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleGuestConfirm = (email: string) => {
    if (selectedBookForCheckout) {
      processCheckout(selectedBookForCheckout.id, email);
    }
    setIsCheckoutModalOpen(false);
  };

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <AnimatedPage>
      <SEOHead
        title="Catálogo de Libros"
        description="Explora nuestra colección de historias cautivadoras. Romance, drama y emociones en cada página. Descubre tu próxima lectura favorita."
        url="http://localhost:3000/libros"
        type="website"
      />
      
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Premium Hero Section */}
        {!loading && books.length > 0 && (
          <header className="mb-20 md:mb-32">
            <div className="relative rounded-[2.5rem] overflow-hidden glass-premium border-white/10 min-h-[500px] flex items-center">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-[#D4AF37]/30 to-transparent" />
                {books[0].cover_image_url && (
                  <img src={books[0].cover_image_url} alt="" className="w-full h-full object-cover blur-2xl" />
                )}
              </div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-8"
                  >
                    <Sparkles size={14} />
                    Obra Destacada de la Semana
                  </motion.div>
                  <h1 className={`text-5xl md:text-7xl font-bold ${textPrimary} mb-6 tracking-tight leading-[1.1]`}>
                    {books[0].title}
                  </h1>
                  <p className={`${textSecondary} text-lg md:text-xl mb-10 font-light max-w-xl leading-relaxed`}>
                    {books[0].description || "Una historia que redefine los límites de la narrativa contemporánea. Sumérgete en el universo de Angie."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <PremiumButton size="lg" onClick={() => handlePurchaseClick(books[0])}>
                      <ShoppingBag size={20} />
                      Adquirir ahora por ${books[0].price}
                    </PremiumButton>
                    <PremiumButton variant="glass" size="lg" onClick={() => navigate(`/read/${books[0].id}`)}>
                      <Eye size={20} />
                      Leer Muestra
                    </PremiumButton>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: -10 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="hidden lg:block perspective-1000"
                >
                  <div className="relative w-80 h-[500px] mx-auto group">
                    {/* Shadow/Glow */}
                    <div className="absolute -inset-4 bg-[#D4AF37]/20 blur-3xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Book Cover Container */}
                    <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-white/20 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-y-0">
                      {books[0].cover_image_url ? (
                        <img src={books[0].cover_image_url} alt={books[0].title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#0A0A0A] flex items-center justify-center">
                          <BookIcon size={100} className="text-[#D4AF37]/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </header>
        )}

        {/* Catalog Header */}
        <header className="mb-12 text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className={`text-3xl md:text-5xl font-bold ${textPrimary} mb-4 tracking-tight`}>
              Explorar Catálogo
            </h2>
            <p className={`${textSecondary} text-sm md:text-base font-light max-w-xl`}>
              Filtrar por categorías o buscar entre nuestras obras publicadas.
            </p>
          </div>
        </header>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-center gap-2 py-4 glass-premium rounded-2xl text-[#D4AF37] font-bold uppercase tracking-widest text-xs"
          >
            <Filter size={18} />
            {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Category Filter Sidebar */}
          <aside className={`lg:col-span-1 space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={(cat) => {
                  setSelectedCategory(cat);
                  setIsFilterOpen(false);
                }}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8 md:space-y-12">
            {/* Search Bar and Sort */}
            <GlassCard noHover className="p-4 md:p-6 border-white/5">
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Buscar por título o descripción..."
                  className="flex-1"
                />
                <div className="h-px w-full bg-white/5 md:hidden" />
                <SortDropdown
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={(sort, order) => {
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                />
              </div>
            </GlassCard>

            {/* Results Count */}
            {!loading && (
              <div className={`px-4 text-[10px] uppercase tracking-[0.2em] font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-[#1B4D3E]/50'}`}>
                {books.length} {books.length === 1 ? 'obra encontrada' : 'obras encontradas'}
                {searchQuery && <span className="text-[#D4AF37]"> para "{searchQuery}"</span>}
              </div>
            )}

            {/* Loading State */}
            {/* @ts-ignore */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                    <BookIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37]" size={24} />
                  </div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest animate-pulse">Consultando archivos...</span>
                </motion.div>
              ) : books.length === 0 ? (
                <GlassCard noHover key="empty" className="text-center py-24 md:py-32 border-white/5 mx-4 md:mx-0">
                  <div className="w-20 h-20 bg-[#1B4D3E]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookIcon size={40} className={theme === 'dark' ? 'text-gray-700' : 'text-[#1B4D3E]/20'} />
                  </div>
                  <p className={`text-lg md:text-xl ${textSecondary} font-light px-6`}>
                    {searchQuery || selectedCategory
                      ? 'No se encontraron libros con los filtros seleccionados.'
                      : 'Aún no hay libros publicados en la biblioteca.'}
                  </p>
                </GlassCard>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
                >
                  {books.map((book) => (
                    <GlassCard 
                      key={book.id} 
                      className="flex flex-col h-full group border-white/5 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
                    >
                      {/* Cover with 3D Effect */}
                      <div 
                        className="h-64 md:h-80 relative overflow-hidden cursor-pointer bg-[#0A0A0A]" 
                        onClick={() => navigate(`/read/${book.id}`)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity" />
                        {book.cover_image_url ? (
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full opacity-20">
                            <BookIcon size={80} />
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                          <PremiumButton variant="glass" size="sm">
                            <Eye size={18} />
                            Vista Previa
                          </PremiumButton>
                        </div>

                        {/* Price Tag */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 glass-premium px-4 py-2 rounded-2xl border-white/20 text-[#D4AF37] font-bold text-base md:text-lg">
                          ${book.price}
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-6 md:p-8 flex flex-col flex-grow">
                        <h3 className={`text-xl md:text-2xl font-bold ${textPrimary} mb-3 group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1`}>
                          {book.title}
                        </h3>
                        
                        <p className={`${textSecondary} text-xs md:text-sm mb-8 line-clamp-3 flex-grow font-light leading-relaxed`}>
                          {book.description || "Explora esta narrativa cautivadora que desafía los sentidos..."}
                        </p>

                        <div className="flex items-center gap-3 mt-auto">
                          <PremiumButton 
                            variant="glass" 
                            size="sm" 
                            className="flex-1 px-2"
                            onClick={() => navigate(`/read/${book.id}`)}
                          >
                            Detalles
                          </PremiumButton>
                          <PremiumButton 
                            variant="secondary" 
                            size="sm" 
                            className="flex-[1.5] px-2"
                            onClick={() => handlePurchaseClick(book)}
                          >
                            <ShoppingBag size={16} />
                            Adquirir
                          </PremiumButton>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Guest Checkout Modal */}
      {selectedBookForCheckout && (
        <GuestCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirm={handleGuestConfirm}
          onLoginClick={() => navigate('/login')}
          bookTitle={selectedBookForCheckout.title}
        />
      )}
    </AnimatedPage>
  );
};

export default BooksPage;
