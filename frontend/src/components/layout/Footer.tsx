import React from 'react';
import NewsletterWidget from '../newsletter/NewsletterWidget';
import { useGlobalStore } from '../../stores/useGlobalStore';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useGlobalStore();

  const footerTopBg = theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]';
  const footerBottomBg = theme === 'dark' ? 'bg-gray-800' : 'bg-[#1B4D3E]';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-[#D4AF37]/30';

  return (
    <footer className={`${footerTopBg} border-t-2 ${borderColor} transition-colors duration-500`}>
      {/* Newsletter Widget */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <NewsletterWidget />
      </div>

      {/* Footer Info */}
      <div className={`${footerBottomBg} py-8`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-[#F5F5DC]'} text-sm mb-4`}>
            &copy; {currentYear} El Rincón de Angie. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="mailto:elrincondeangie8@gmail.com"
              className="text-[#D4AF37] font-semibold hover:text-white transition-colors"
            >
              Contacto y Soporte
            </a>
            <span className="text-gray-500">|</span>
            <span className="text-[#D4AF37]/50 italic">Hecho con amor y literatura</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
