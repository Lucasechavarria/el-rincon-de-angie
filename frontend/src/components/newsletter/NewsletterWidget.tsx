import React from 'react';
import NewsletterForm from './NewsletterForm';
import { Sparkles } from 'lucide-react';
import { useGlobalStore } from '../../stores/useGlobalStore';

const NewsletterWidget: React.FC = () => {
    const { theme } = useGlobalStore();

    const widgetBg = theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
        : 'bg-gradient-to-br from-[#1B4D3E] to-[#1B4D3E]/80';
    
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-white';
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-[#F5F5DC]';

    return (
        <div className={`${widgetBg} rounded-2xl p-10 ${textColor} shadow-2xl relative overflow-hidden transition-all duration-500`}>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/10'}`}>
                        <Sparkles className="text-[#D4AF37]" size={36} />
                    </div>
                    <h3 className="text-3xl font-serif font-bold tracking-tight">No te pierdas nada</h3>
                </div>

                <p className={`${subTextColor} mb-8 text-lg leading-relaxed max-w-2xl`}>
                    Suscríbete a nuestro newsletter y sé el primero en enterarte de nuevas historias,
                    lanzamientos exclusivos y contenido especial que solo Angie comparte con sus lectores.
                </p>

                <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/10'} backdrop-blur-md rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-600' : 'border-white/20'}`}>
                    <NewsletterForm variant="compact" />
                </div>
            </div>
        </div>
    );
};

export default NewsletterWidget;
