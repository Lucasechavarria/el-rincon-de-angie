import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, BookOpen, ChevronDown } from 'lucide-react';
import { useGlobalStore } from '../../stores/useGlobalStore';

const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { theme } = useGlobalStore();
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
    setShowUserMenu(false);
  };

  const dropdownBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#1B4D3E]/20';
  const itemHover = theme === 'dark' ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-[#F5F5DC] text-[#1B4D3E]';

  return (
    <header className="relative flex justify-between items-center py-6 mb-12 px-6 transition-all duration-500">
      {/* Left spacer for balance */}
      <div className="w-32 hidden md:block"></div>

      {/* Center - Full Logo Image */}
      <div className="text-center flex-1">
        <Link to="/" className="inline-block">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hover:scale-105 transition-transform duration-300"
          >
            {/* Full Logo - El rincon de Angie3.png */}
            <img
              src="/El rincon de Angie3.png"
              alt="El Rincón de Angie"
              className={`h-28 md:h-36 lg:h-48 w-auto mx-auto drop-shadow-2xl transition-all duration-500 ${
                theme === 'dark' ? 'brightness-110 contrast-110 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]' : ''
              }`}
            />
          </motion.div>
        </Link>
      </div>

      {/* Right - User Menu */}
      <div className="w-32 flex justify-end items-center">
        {token && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 p-1.5 pr-3 ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-[#1B4D3E] hover:bg-[#153e32]'
              } rounded-full transition-all shadow-lg group`}
            >
              <div className={`w-9 h-9 ${theme === 'dark' ? 'bg-gray-700' : 'bg-[#D4AF37]'} rounded-full flex items-center justify-center text-[#1B4D3E] group-hover:scale-110 transition-transform`}>
                <User size={18} />
              </div>
              <ChevronDown size={16} className={`text-[#D4AF37] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`absolute right-0 mt-3 w-56 ${dropdownBg} rounded-2xl shadow-2xl border-2 py-3 z-50 overflow-hidden backdrop-blur-md`}
              >
                <div className="px-4 py-2 mb-2 border-b border-gray-700/10">
                  <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#1B4D3E]/50'}`}>
                    Mi Cuenta
                  </p>
                </div>
                <Link
                  to="/perfil"
                  onClick={() => setShowUserMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 ${itemHover} transition-colors font-medium`}
                >
                  <User size={18} className="text-[#D4AF37]" />
                  Perfil
                </Link>
                <Link
                  to="/library"
                  onClick={() => setShowUserMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 ${itemHover} transition-colors font-medium`}
                >
                  <BookOpen size={18} className="text-[#D4AF37]" />
                  Biblioteca
                </Link>
                <div className="border-t border-gray-700/10 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors font-bold uppercase tracking-tighter text-sm"
                  >
                    <LogOut size={18} />
                    Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;