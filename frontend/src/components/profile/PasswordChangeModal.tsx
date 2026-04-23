import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
        if (password.length === 0) return { strength: '', color: '', width: '0%' };
        if (password.length < 6) return { strength: 'Débil', color: 'bg-red-500', width: '33%' };
        if (password.length < 10) return { strength: 'Media', color: 'bg-yellow-500', width: '66%' };
        return { strength: 'Fuerte', color: 'bg-green-500', width: '100%' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('current_password', formData.currentPassword);
            formDataToSend.append('new_password', formData.newPassword);

            await axios.post('http://localhost:8000/profile/change-password', formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#1B4D3E] flex items-center gap-2">
                        <Lock size={24} />
                        Cambiar Contraseña
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <Check size={20} />
                            ¡Contraseña cambiada exitosamente!
                        </div>
                    )}

                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1B4D3E] mb-2">
                            Contraseña Actual
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2 pr-10 border-2 border-[#1B4D3E]/20 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1B4D3E] mb-2">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-2 pr-10 border-2 border-[#1B4D3E]/20 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Seguridad:</span>
                                    <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                        {passwordStrength.strength}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                        style={{ width: passwordStrength.width }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1B4D3E] mb-2">
                            Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 pr-10 border-2 border-[#1B4D3E]/20 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#153e32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Cambiando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangeModal;
