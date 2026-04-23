import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';

const UnsubscribePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            handleUnsubscribe();
        }
    }, [token]);

    const handleUnsubscribe = async () => {
        try {
            const response = await axios.post(
                `http://localhost:8000/newsletter/unsubscribe/${token}`
            );
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al procesar la cancelación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                {loading ? (
                    <div className="text-center">
                        <Loader2 className="animate-spin text-[#1B4D3E] mx-auto mb-4" size={48} />
                        <p className="text-gray-600">Procesando...</p>
                    </div>
                ) : success ? (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="text-green-600" size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-[#1B4D3E] mb-2">
                            Suscripción Cancelada
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Te has dado de baja del newsletter exitosamente.
                            Lamentamos verte partir.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#1B4D3E]/90 transition-colors"
                        >
                            <Home size={20} />
                            Volver al Inicio
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
                            <XCircle className="text-red-600" size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-[#1B4D3E] mb-2">
                            Error
                        </h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#1B4D3E]/90 transition-colors"
                        >
                            <Home size={20} />
                            Volver al Inicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnsubscribePage;
