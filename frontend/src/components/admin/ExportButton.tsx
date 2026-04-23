import React, { useState } from 'react';
import axios from 'axios';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
    token: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ token }) => {
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleExport = async (dataType: 'sales' | 'users' | 'books') => {
        setLoading(true);
        setShowDropdown(false);

        try {
            const response = await axios.post(
                `http://localhost:8000/admin/analytics/export?data_type=${dataType}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${dataType}_export.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error al exportar datos. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#1B4D3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Exportando...
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Exportar Datos
                    </>
                )}
            </button>

            {showDropdown && !loading && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                        onClick={() => handleExport('sales')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg transition-colors"
                    >
                        Exportar Ventas
                    </button>
                    <button
                        onClick={() => handleExport('users')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                        Exportar Usuarios
                    </button>
                    <button
                        onClick={() => handleExport('books')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg transition-colors"
                    >
                        Exportar Libros
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
