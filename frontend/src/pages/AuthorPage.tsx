import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Feather, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import StructuredData from '../components/seo/StructuredData';
import ContactForm from '../components/author/ContactForm';
import { useGlobalStore } from '../stores/useGlobalStore';
import { AnimatedPage } from '../components/ui/AnimatedPage';

interface AuthorInfo {
  id: number;
  name: string;
  bio: string;
  photo_url: string | null;
  email: string | null;
}

interface TimelineItem {
  id: number;
  year: number;
  title: string;
  description: string;
  book_id: number | null;
  book_title: string | null;
}

const AuthorPage: React.FC = () => {
  const [author, setAuthor] = useState<AuthorInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useGlobalStore();

  useEffect(() => {
    fetchAuthorInfo();
    fetchTimeline();
  }, []);

  const fetchAuthorInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/author/info');
      setAuthor(response.data);
    } catch (error) {
      console.error('Error fetching author info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await axios.get('http://localhost:8000/author/timeline');
      setTimeline(response.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const bgMain = theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-[#1B4D3E]';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-700';
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#D4AF37]';

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgMain}`}>
        <Loader2 className={`animate-spin ${theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#1B4D3E]'}`} size={48} />
      </div>
    );
  }

  if (!author) {
    return (
      <div className={`container mx-auto px-4 py-8 ${bgMain}`}>
        <p className="text-center text-red-600">Error al cargar la información de la autora</p>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <SEOHead
        title="Sobre la Autora - Angie"
        description={author?.bio || "Conoce a Angie, autora de historias que tocan el corazón. Descubre su trayectoria, inspiraciones y obras publicadas."}
        url="http://localhost:3000/autora"
        type="article"
        author="Angie"
      />
      {author && (
        <StructuredData
          type="Person"
          data={{
            name: author.name,
            bio: author.bio,
            image: author.photo_url,
            jobTitle: "Autora",
            url: "http://localhost:3000/autora"
          }}
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-gray-700' : 'from-[#1B4D3E] to-[#153e32]'} rounded-2xl p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-2xl`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className={`w-32 h-32 md:w-40 md:h-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-[#D4AF37]'} rounded-full flex items-center justify-center text-[#1B4D3E] text-5xl md:text-6xl font-bold shadow-2xl border-4 border-[#D4AF37]/30`}>
              {author.name.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <Feather size={32} className="text-[#D4AF37]" />
                <h1 className={`text-4xl md:text-5xl font-serif font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-white'}`}>{author.name}</h1>
              </div>
              <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-[#F5F5DC]/90'} font-serif italic`}>
                Escritora • Narradora de Historias
              </p>
            </div>
          </div>
        </motion.div>

        {/* Biography Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className={`${cardBg} rounded-xl shadow-lg p-8 border-l-8`}>
            <h2 className={`text-3xl font-serif font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
              <BookOpen size={32} className="text-[#D4AF37]" />
              Sobre la Autora
            </h2>
            <div className="prose prose-lg max-w-none">
              {author.bio.split('\n').map((paragraph, index) => (
                <p key={index} className={`${textSecondary} leading-relaxed mb-4 text-lg`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Timeline Section */}
        {timeline.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className={`text-3xl font-serif font-bold ${textPrimary} mb-8 flex items-center gap-3`}>
              <Calendar size={32} className="text-[#D4AF37]" />
              Cronología de Publicaciones
            </h2>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className={`${cardBg} rounded-xl shadow-md p-6 border-l-4 ${theme === 'dark' ? 'border-[#D4AF37]' : 'border-[#1B4D3E]'} hover:shadow-lg transition-all transform hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`bg-[#D4AF37] text-[#1B4D3E] font-bold text-xl px-4 py-2 rounded-lg min-w-[80px] text-center shadow-md`}>
                      {item.year}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-serif font-bold ${textPrimary} mb-2`}>
                        {item.title}
                      </h3>
                      <p className={`${textSecondary} mb-3`}>{item.description}</p>
                      {item.book_id && (
                        <button
                          onClick={() => navigate(`/read/${item.book_id}`)}
                          className={`text-[#D4AF37] hover:${theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]'} font-semibold flex items-center gap-2 transition-colors`}
                        >
                          <BookOpen size={18} />
                          Leer "{item.book_title}"
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contact Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <ContactForm />
        </motion.section>

        {/* Decorative Footer */}
        <div className="text-center py-8">
          <div className={`flex items-center justify-center gap-4 ${theme === 'dark' ? 'text-[#D4AF37]/30' : 'text-[#1B4D3E]/30'}`}>
            <div className={`h-px w-24 ${theme === 'dark' ? 'bg-[#D4AF37]/20' : 'bg-[#1B4D3E]/20'}`}></div>
            <Feather size={24} />
            <div className={`h-px w-24 ${theme === 'dark' ? 'bg-[#D4AF37]/20' : 'bg-[#1B4D3E]/20'}`}></div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AuthorPage;
