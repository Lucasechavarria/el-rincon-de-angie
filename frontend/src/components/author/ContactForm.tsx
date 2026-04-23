import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useGlobalStore } from '../../stores/useGlobalStore';

interface ContactFormProps {
    onSuccess?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const { theme } = useGlobalStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/author/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Error al enviar el mensaje');
            }

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });

            if (onSuccess) {
                onSuccess();
            }

            setTimeout(() => {
                setStatus('idle');
            }, 5000);

        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Error al enviar el mensaje');
        }
    };

    const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 shadow-none' : 'bg-white border-[#D4AF37]/20 shadow-xl';
    const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
    const inputBorder = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
    const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

    return (
        <div className={`${cardBg} rounded-2xl p-8 md:p-10 border transition-all duration-500`}>
            <div className="mb-8">
                <h3 className={`text-3xl font-serif font-bold ${textPrimary} mb-3 flex items-center gap-3`}>
                    <MessageSquare className="text-[#D4AF37]" size={32} />
                    Contáctame
                </h3>
                <p className={`${textSecondary} text-lg`}>
                    ¿Tienes alguna pregunta o comentario? Me encantaría saber de ti.
                </p>
            </div>

            {status === 'success' && (
                <div className="mb-8 p-5 bg-green-900/30 border border-green-500/50 rounded-xl flex items-start text-green-200">
                    <CheckCircle className="w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-lg">¡Mensaje enviado exitosamente!</p>
                        <p className="text-sm mt-1 opacity-90">
                            Gracias por contactarme. Te responderé lo antes posible.
                        </p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="mb-8 p-5 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start text-red-200">
                    <AlertCircle className="w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-lg">Error al enviar el mensaje</p>
                        <p className="text-sm mt-1 opacity-90">{errorMessage}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className={`block text-sm font-bold uppercase tracking-widest ${labelColor} mb-3`}>
                            Nombre
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#D4AF37]">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`block w-full pl-12 pr-4 py-4 ${inputBg} border-2 ${inputBorder} rounded-xl leading-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-all text-lg`}
                                placeholder="Tu nombre"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className={`block text-sm font-bold uppercase tracking-widest ${labelColor} mb-3`}>
                            Email
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#D4AF37]">
                                <Mail className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`block w-full pl-12 pr-4 py-4 ${inputBg} border-2 ${inputBorder} rounded-xl leading-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-all text-lg`}
                                placeholder="tu@email.com"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="message" className={`block text-sm font-bold uppercase tracking-widest ${labelColor} mb-3`}>
                        Mensaje
                    </label>
                    <div className="relative group">
                        <div className="absolute top-4 left-4 pointer-events-none transition-colors group-focus-within:text-[#D4AF37]">
                            <MessageSquare className="h-5 w-5 text-gray-500" />
                        </div>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className={`block w-full pl-12 pr-4 py-4 ${inputBg} border-2 ${inputBorder} rounded-xl leading-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-all text-lg resize-none`}
                            placeholder="Escribe tu mensaje aquí..."
                            disabled={status === 'loading'}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`w-full flex justify-center items-center px-8 py-4 border-2 border-transparent text-lg font-bold rounded-xl text-[#1B4D3E] bg-[#D4AF37] hover:bg-[#b5952f] shadow-xl hover:shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest`}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="w-6 h-6 mr-3" />
                                Enviar Mensaje
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
