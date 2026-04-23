import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

interface Transaction {
    id: number;
    book_title: string;
    amount: number;
    status: string;
    created_at: string;
    transaction_id: string;
}

const TransactionHistoryPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/profile/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'completed':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={20} />;
            case 'rejected':
            case 'failed':
                return <XCircle className="text-red-500" size={20} />;
            default:
                return <Clock className="text-gray-500" size={20} />;
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'approved': 'Aprobado',
            'completed': 'Completado',
            'pending': 'Pendiente',
            'rejected': 'Rechazado',
            'failed': 'Fallido'
        };
        return statusMap[status.toLowerCase()] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'rejected':
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-[#1B4D3E]" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
                    <AlertCircle size={24} />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#1B4D3E] mb-2">Historial de Transacciones</h1>
                <p className="text-gray-600">
                    {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'} en total
                </p>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-20">
                    <DollarSign size={64} className="mx-auto text-[#1B4D3E]/30 mb-4" />
                    <h2 className="text-2xl font-serif font-bold text-[#1B4D3E] mb-2">
                        No tienes transacciones aún
                    </h2>
                    <p className="text-gray-600">
                        Tus compras aparecerán aquí
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#1B4D3E] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Fecha</th>
                                    <th className="px-6 py-4 text-left font-semibold">Libro</th>
                                    <th className="px-6 py-4 text-left font-semibold">Monto</th>
                                    <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                    <th className="px-6 py-4 text-left font-semibold">ID Transacción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-gray-700">
                                                <Calendar size={16} className="mr-2" />
                                                {new Date(transaction.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-[#1B4D3E]">{transaction.book_title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#D4AF37] font-bold text-lg">
                                                ${transaction.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(transaction.status)}`}>
                                                {getStatusIcon(transaction.status)}
                                                {getStatusText(transaction.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 font-mono">
                                                {transaction.transaction_id}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {currentTransactions.map((transaction) => (
                            <div key={transaction.id} className="bg-white rounded-lg shadow-lg p-4 border-2 border-[#D4AF37]/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 flex items-center gap-2">
                                        <Calendar size={16} />
                                        {new Date(transaction.created_at).toLocaleDateString('es-ES')}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transaction.status)}`}>
                                        {getStatusIcon(transaction.status)}
                                        {getStatusText(transaction.status)}
                                    </span>
                                </div>
                                <h3 className="font-bold text-[#1B4D3E] mb-2">{transaction.book_title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#D4AF37] font-bold text-xl">
                                        ${transaction.amount.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {transaction.transaction_id.slice(0, 12)}...
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border-2 border-[#1B4D3E] text-[#1B4D3E] rounded-lg hover:bg-[#1B4D3E] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                Anterior
                            </button>
                            <span className="px-4 py-2 text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border-2 border-[#1B4D3E] text-[#1B4D3E] rounded-lg hover:bg-[#1B4D3E] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TransactionHistoryPage;
