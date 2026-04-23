import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, FileText, Loader2, Check } from 'lucide-react';

interface ProfileEditFormProps {
    initialData: {
        email: string;
        bio: string;
    };
    onSuccess: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ initialData, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: initialData.email || '',
        bio: initialData.bio || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('email', formData.email);
            formDataToSend.append('bio', formData.bio);

            await axios.put('http://localhost:8000/profile/', formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Check size={20} />
                    ¡Perfil actualizado exitosamente!
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold text-[#1B4D3E] mb-2">
                    <Mail className="inline mr-2" size={18} />
                    Email
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#1B4D3E]/20 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="tu@email.com"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-[#1B4D3E] mb-2">
                    <FileText className="inline mr-2" size={18} />
                    Biografía
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-[#1B4D3E]/20 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                    placeholder="Cuéntanos un poco sobre ti..."
                />
                <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/500 caracteres
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#1B4D3E] text-white font-bold rounded-lg hover:bg-[#153e32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Guardando...
                    </>
                ) : (
                    <>
                        <User size={20} />
                        Guardar Cambios
                    </>
                )}
            </button>
        </form>
    );
};

export default ProfileEditForm;
