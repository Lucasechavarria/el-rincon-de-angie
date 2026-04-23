import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import { useGlobalStore } from '../stores/useGlobalStore';

export const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { theme } = useGlobalStore();
    
    const bgMain = theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textMain = theme === 'dark' ? 'text-gray-100' : 'text-[#1B4D3E]';

    return (
        <AnimatedPage className={`min-h-screen ${bgMain} flex items-center justify-center p-8 transition-colors duration-500`}>
            <div className={`${cardBg} rounded-xl shadow-2xl p-12 max-w-md w-full text-center border-t-4 border-[#D4AF37]`}>
                <div className="bg-green-100/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-200">
                    <CheckCircle className="text-green-500" size={64} />
                </div>

                <h1 className={`text-3xl font-serif font-bold ${textMain} mb-4`}>
                    ¡Pago Exitoso!
                </h1>

                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                    Tu compra se ha procesado correctamente. Ya puedes acceder al contenido completo del libro.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/biblioteca')}
                        className="w-full bg-[#D4AF37] text-[#1B4D3E] py-3 rounded-full font-bold hover:bg-[#b5952f] transition-all transform hover:-translate-y-1 shadow-lg uppercase tracking-wider"
                    >
                        Ir a Mi Biblioteca
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className={`w-full border-2 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-[#1B4D3E]/30 text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white'} py-3 rounded-full font-bold transition-colors uppercase tracking-wider`}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </AnimatedPage>
    );
};
