/* eslint-disable import/first */
import React, { useState, useEffect } from 'react';
import { User, BookOpen, CreditCard, Loader2, Lock, Sparkles, ShieldCheck, Mail, Calendar, Edit3 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence as AnimatePresenceOriginal } from 'framer-motion';
const AnimatePresence = AnimatePresenceOriginal as any;
import { AnimatedPage } from '../components/ui/AnimatedPage';
import SEOHead from '../components/seo/SEOHead';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import PasswordChangeModal from '../components/profile/PasswordChangeModal';
import { useGlobalStore } from '../stores/useGlobalStore';

interface UserProfile {
  id: number;
  user_id: number;
  username: string;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  cover_image_url: string | null;
}

interface Transaction {
  id: number;
  book_id: number;
  book_title: string;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

type TabType = 'profile' | 'library' | 'transactions';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [library, setLibrary] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useGlobalStore();
  const token = localStorage.getItem('access_token');
  const isAdmin = JSON.parse(localStorage.getItem('is_admin') || 'false');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      // Sync localStorage if role changed
      if (response.data.is_admin !== isAdmin) {
        localStorage.setItem('is_admin', JSON.stringify(response.data.is_admin));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/me/library', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLibrary(response.data);
    } catch (error) {
      console.error('Error fetching library:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/me/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'library' && library.length === 0) {
      fetchLibrary();
    } else if (activeTab === 'transactions' && transactions.length === 0) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]';
  const textSecondary = theme === 'dark' ? 'text-white/60' : 'text-[#1B4D3E]/70';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
        <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">Cargando tu rincón...</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <AnimatedPage>
      <SEOHead title="Mi Perfil" description="Gestiona tu cuenta y colección en El Rincón de Angie." />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header - Premium Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <GlassCard noHover className="p-8 md:p-12 border-white/10 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#1B4D3E]/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[1.4rem] bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-[#D4AF37]" />
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#1B4D3E] p-1.5 rounded-full shadow-lg">
                    <ShieldCheck size={16} />
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className={`text-4xl font-bold ${textPrimary} tracking-tight`}>{profile.username}</h1>
                  {isAdmin && (
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">
                      Administrador
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                  <div className={`flex items-center gap-2 ${textSecondary}`}>
                    <Mail size={14} className="text-[#D4AF37]" />
                    {profile.email || 'Sin correo vinculado'}
                  </div>
                  <div className={`flex items-center gap-2 ${textSecondary}`}>
                    <Calendar size={14} className="text-[#D4AF37]" />
                    Miembro desde {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <PremiumButton size="sm" variant="secondary" onClick={() => setShowEditForm(!showEditForm)}>
                  <Edit3 size={16} />
                  {showEditForm ? 'Cerrar Edición' : 'Editar Perfil'}
                </PremiumButton>
                <PremiumButton size="sm" variant="glass" onClick={() => setShowPasswordModal(true)}>
                  <Lock size={16} />
                  Seguridad
                </PremiumButton>
              </div>
            </div>

            <AnimatePresence>
              {showEditForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-12 pt-12 border-t border-white/5"
                >
                  <ProfileEditForm 
                    initialData={{ email: profile.email || '', bio: profile.bio || '' }} 
                    onSuccess={() => { fetchProfile(); setShowEditForm(false); }} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'profile', label: 'Sobre Mí', icon: User },
            { id: 'library', label: 'Mi Colección', icon: BookOpen },
            { id: 'transactions', label: 'Mis Compras', icon: CreditCard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 border font-bold text-xs uppercase tracking-widest whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#D4AF37] text-[#1B4D3E] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && (
              <GlassCard noHover className="p-8 border-white/5">
                <h3 className={`text-xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
                  <Sparkles size={20} className="text-[#D4AF37]" />
                  Biografía
                </h3>
                <p className={`${textSecondary} font-light leading-relaxed text-lg italic`}>
                  "{profile.bio || 'Aún no has escrito tu historia personal...'}"
                </p>
              </GlassCard>
            )}

            {activeTab === 'library' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {library.length === 0 ? (
                  <GlassCard noHover className="col-span-full py-24 text-center border-white/5">
                    <BookOpen size={48} className="mx-auto mb-4 text-white/10" />
                    <p className="text-white/30 font-light">Tu biblioteca está esperando ser llenada.</p>
                    <PremiumButton className="mt-8" onClick={() => navigate('/libros')}>Explorar Catálogo</PremiumButton>
                  </GlassCard>
                ) : (
                  library.map((book) => (
                    <GlassCard key={book.id} className="group overflow-hidden border-white/5">
                      <div className="aspect-[2/3] relative">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-black/40 flex items-center justify-center">
                            <BookOpen size={48} className="text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 gap-4">
                          <PremiumButton size="sm" variant="secondary" className="w-full" onClick={() => navigate(`/read/${book.id}`)}>
                            Leer Ahora
                          </PremiumButton>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className={`font-bold ${textPrimary} truncate`}>{book.title}</h4>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <GlassCard noHover className="overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <th className="px-8 py-6 text-left">Obra</th>
                        <th className="px-8 py-6 text-left">Monto</th>
                        <th className="px-8 py-6 text-left">Estado</th>
                        <th className="px-8 py-6 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center text-white/20 font-light italic">
                            No se registran transacciones recientes.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <span className={`font-bold ${textPrimary}`}>{transaction.book_title}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-[#D4AF37] font-bold">${transaction.amount}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-white/30 text-sm">{new Date(transaction.created_at).toLocaleDateString()}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </AnimatedPage>
  );
};

export default ProfilePage;
