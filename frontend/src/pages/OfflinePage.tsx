import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfflinePage: React.FC = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="inline-flex items-center justify-center p-6 bg-[#1B4D3E]/10 rounded-full mb-6">
                    <WifiOff className="text-[#1B4D3E]" size={64} />
                </div>

                <h1 className="text-3xl font-serif font-bold text-[#1B4D3E] mb-4">
                    Sin Conexión
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Parece que no tienes conexión a internet en este momento.
                    Algunas funciones pueden no estar disponibles.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleRetry}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#1B4D3E]/90 transition-colors font-semibold"
                    >
                        <RefreshCw size={20} />
                        Reintentar Conexión
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#1B4D3E] rounded-lg hover:bg-[#D4AF37]/90 transition-colors font-semibold"
                    >
                        <Home size={20} />
                        Ir al Inicio
                    </button>
                </div>

                <div className="mt-8 p-4 bg-[#F5F5DC] rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Tip:</strong> Algunos contenidos pueden estar disponibles offline
                        si los has visitado anteriormente.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfflinePage;
