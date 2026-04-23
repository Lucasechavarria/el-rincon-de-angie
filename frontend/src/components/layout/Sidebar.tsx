import React, { useState } from 'react';
import { Book, Home, User, LogIn, Menu, X, Mail, Sun, Moon, Sparkles, Shield, Feather } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalStore } from '../../stores/useGlobalStore';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useGlobalStore();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const token = localStorage.getItem('access_token');
  const isAdmin = JSON.parse(localStorage.getItem('is_admin') || 'false');

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/libros', icon: Book, label: 'Catálogo' },
    { path: '/mis-libros', icon: Sparkles, label: 'Mis Libros', protected: true },
    { path: '/perfil', icon: User, label: 'Mi Perfil', protected: true },
    { path: '/admin', icon: Shield, label: 'Admin Panel', protected: true, adminOnly: true },
    { path: '/about', icon: Feather, label: 'La Autora' },
  ];

  const sidebarBg = theme === 'dark' ? 'bg-[#0A0A0A]/95' : 'bg-[#1B4D3E]/95';
  const sidebarText = 'text-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-white/5';
  
  const getNavLinkClasses = (isActive: boolean) => {
    return `relative flex items-center px-6 py-4 rounded-2xl transition-all duration-500 group overflow-hidden ${
      isActive
        ? 'text-[#D4AF37] font-bold'
        : 'text-white/70 hover:text-white'
    }`;
  };

  return (
    <>
      {/* Mobile Menu Button - More Premium */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleSidebar}
        className={`md:hidden fixed top-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border border-white/20 backdrop-blur-xl ${
          isOpen ? 'bg-[#D4AF37] text-[#1B4D3E]' : sidebarBg + ' text-[#D4AF37]'
        }`}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </motion.button>

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-40 w-72 ${sidebarBg} ${sidebarText}
        transform transition-all duration-700 ease-[0.16, 1, 0.3, 1] backdrop-blur-3xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col border-r ${borderColor} shadow-2xl
      `}>
        {/* Logo / Brand Area */}
        <div className={`p-8 text-center relative overflow-hidden flex-shrink-0`}>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          
          <Link to="/" onClick={() => setIsOpen(false)} className="block relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-32 h-32 mx-auto mb-6 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden border-2 border-[#D4AF37]/50 p-1"
            >
              <img
                src="/El rincon de Angie2.png"
                alt="El Rincón de Angie"
                className="w-full h-full object-cover rounded-[2.2rem]"
              />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight text-gradient-gold">EL RINCÓN DE ANGIE</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-1">Editorial Digital</p>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.filter(item => {
            if (item.adminOnly && !isAdmin) return false;
            return true;
          }).map((item) => (
            (!item.protected || token) && (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => getNavLinkClasses(isActive)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-white/5 rounded-2xl -z-10"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={`mr-4 h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-['Outfit'] text-xs uppercase tracking-[0.15em]">{item.label}</span>
                    {isActive && <Sparkles className="ml-auto h-3 w-3 text-[#D4AF37]" />}
                  </>
                )}
              </NavLink>
            )
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-6 border-t ${borderColor} flex-shrink-0 space-y-4`}>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 group"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
            {theme === 'dark' ? <Sun size={16} className="text-[#D4AF37]" /> : <Moon size={16} className="text-[#D4AF37]" />}
          </button>

          {!token ? (
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#D4AF37] text-[#1B4D3E] font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-[#D4AF37]/10"
              >
                <LogIn size={18} />
                Iniciar Sesión
              </motion.button>
            </Link>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-white/70 hover:text-white font-bold uppercase tracking-widest text-[10px] border border-white/10 transition-all"
            >
              Cerrar Sesión
            </motion.button>
          )}
          
          <div className="pt-2 text-center">
            <p className="text-[8px] opacity-20 font-light tracking-widest">
              EST. 2026 &bull; EL RINCÓN DE ANGIE
            </p>
          </div>
        </div>
          
          <div className="pt-4 text-center">
            <p className="text-[10px] opacity-30 font-light tracking-tighter">
              &copy; 2026 EL RINCÓN DE ANGIE
            </p>
          </div>
      </aside>

      {/* Overlay for mobile */}
      {/* @ts-ignore - Framer Motion type definition issue with React 18 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
