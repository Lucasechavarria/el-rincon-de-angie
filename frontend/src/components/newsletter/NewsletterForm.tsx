import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { useGlobalStore } from '../../stores/useGlobalStore';

interface NewsletterFormProps {
    variant?: 'default' | 'compact';
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ variant = 'default' }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { theme } = useGlobalStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('email', email);

            await axios.post(
                'http://localhost:8000/newsletter/subscribe',
                formData
            );

            setSuccess(true);
            setEmail('');
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al suscribirse. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const inputBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const inputBorder = theme === 'dark' ? 'border-gray-600' : 'border-[#1B4D3E]/20';
    const inputText = theme === 'dark' ? 'text-white' : 'text-[#1B4D3E]';

    if (variant === 'compact') {
        return (
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email"
                    required
                    className={`flex-1 px-5 py-3 border-2 ${inputBorder} rounded-xl focus:outline-none focus:border-[#D4AF37] ${inputBg} ${inputText} transition-all`}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-[#D4AF37] text-[#1B4D3E] rounded-xl font-bold hover:bg-[#b5952f] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg uppercase tracking-wider text-sm"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Suscribirse'}
                </button>
            </form>
        );
    }

    const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#D4AF37]/20';
    const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-[#1B4D3E]';

    return (
        <div className={`${cardBg} rounded-2xl shadow-xl p-8 border transition-all duration-500`}>
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-[#1B4D3E]/10'} rounded-full`}>
                    <Mail className={theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#1B4D3E]'} size={28} />
                </div>
                <div>
                    <h3 className={`text-2xl font-serif font-bold ${textPrimary}`}>Suscríbete al Newsletter</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Recibe noticias sobre nuevas publicaciones</p>
                </div>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-200">
                    <CheckCircle size={24} />
                    <p className="font-semibold">¡Gracias por suscribirte!</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className={`w-full px-5 py-4 border-2 ${inputBorder} rounded-xl focus:outline-none focus:border-[#D4AF37] ${inputBg} ${inputText} transition-all text-lg`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-8 py-4 ${theme === 'dark' ? 'bg-[#D4AF37] text-[#1B4D3E]' : 'bg-[#1B4D3E] text-white'} rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl uppercase tracking-widest`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>Suscribiendo...</span>
                        </>
                    ) : (
                        <>
                            <Mail size={24} />
                            <span>Suscribirse</span>
                        </>
                    )}
                </button>

                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-center italic`}>
                    Al suscribirte, aceptas recibir emails sobre nuevas publicaciones.
                    Puedes cancelar tu suscripción en cualquier momento.
                </p>
            </form>
        </div>
    );
};

export default NewsletterForm;
