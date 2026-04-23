import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Users, Send, Loader2, FileText } from 'lucide-react';

interface AdminNewsletterPanelProps {
    token: string;
}

const AdminNewsletterPanel: React.FC<AdminNewsletterPanelProps> = ({ token }) => {
    const [activeView, setActiveView] = useState<'compose' | 'subscribers' | 'logs'>('compose');
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [emailLogs, setEmailLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Compose form state
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    useEffect(() => {
        if (activeView === 'subscribers') {
            fetchSubscribers();
        } else if (activeView === 'logs') {
            fetchEmailLogs();
        }
    }, [activeView]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                'http://localhost:8000/admin/subscribers',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubscribers(response.data);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmailLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                'http://localhost:8000/admin/email-logs',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmailLogs(response.data);
        } catch (error) {
            console.error('Error fetching email logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setSendSuccess(false);

        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('content', content);

            await axios.post(
                'http://localhost:8000/admin/newsletter/send',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSendSuccess(true);
            setSubject('');
            setContent('');
            setTimeout(() => setSendSuccess(false), 5000);
        } catch (error) {
            console.error('Error sending newsletter:', error);
            alert('Error al enviar newsletter');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Mail size={24} className="text-[#1B4D3E]" />
                Gestión de Newsletter
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
                <button
                    onClick={() => setActiveView('compose')}
                    className={`px-4 py-2 font-semibold transition-colors ${activeView === 'compose'
                            ? 'text-[#1B4D3E] border-b-2 border-[#D4AF37]'
                            : 'text-gray-500 hover:text-[#1B4D3E]'
                        }`}
                >
                    <Send size={18} className="inline mr-2" />
                    Enviar Newsletter
                </button>
                <button
                    onClick={() => setActiveView('subscribers')}
                    className={`px-4 py-2 font-semibold transition-colors ${activeView === 'subscribers'
                            ? 'text-[#1B4D3E] border-b-2 border-[#D4AF37]'
                            : 'text-gray-500 hover:text-[#1B4D3E]'
                        }`}
                >
                    <Users size={18} className="inline mr-2" />
                    Suscriptores
                </button>
                <button
                    onClick={() => setActiveView('logs')}
                    className={`px-4 py-2 font-semibold transition-colors ${activeView === 'logs'
                            ? 'text-[#1B4D3E] border-b-2 border-[#D4AF37]'
                            : 'text-gray-500 hover:text-[#1B4D3E]'
                        }`}
                >
                    <FileText size={18} className="inline mr-2" />
                    Historial
                </button>
            </div>

            {/* Compose View */}
            {activeView === 'compose' && (
                <div>
                    {sendSuccess && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg">
                            <p className="text-green-700 font-semibold">¡Newsletter enviado exitosamente!</p>
                        </div>
                    )}

                    <form onSubmit={handleSendNewsletter} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Asunto
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                placeholder="Asunto del newsletter"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contenido (HTML permitido)
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={10}
                                placeholder="<p>Contenido del newsletter...</p>"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37] font-mono text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full px-6 py-3 bg-[#1B4D3E] text-white rounded-lg font-semibold hover:bg-[#1B4D3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Enviar a Todos los Suscriptores
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Subscribers View */}
            {activeView === 'subscribers' && (
                <div>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#1B4D3E]" size={48} />
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 p-4 bg-[#F5F5DC] rounded-lg">
                                <p className="text-[#1B4D3E] font-semibold">
                                    Total de suscriptores activos: {subscribers.filter(s => s.is_active).length}
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#1B4D3E] text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-center">Estado</th>
                                            <th className="px-4 py-3 text-left">Fecha Suscripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub) => (
                                            <tr key={sub.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{sub.email}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${sub.is_active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {sub.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {new Date(sub.subscribed_at).toLocaleDateString('es-ES')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {subscribers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No hay suscriptores
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Logs View */}
            {activeView === 'logs' && (
                <div>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#1B4D3E]" size={48} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#1B4D3E] text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Destinatario</th>
                                        <th className="px-4 py-3 text-left">Template</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emailLogs.map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">{log.recipient}</td>
                                            <td className="px-4 py-3">{log.template_name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${log.status === 'sent'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {log.status === 'sent' ? 'Enviado' : 'Fallido'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(log.sent_at).toLocaleString('es-ES')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {emailLogs.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No hay registros de emails
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminNewsletterPanel;
