import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string | null;
    purchases: number;
    created_at: string | null;
    is_active: boolean;
}

interface UserManagementTableProps {
    token: string;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ token }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8000/admin/users?search=${search}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
        setUpdatingUserId(userId);
        try {
            const formData = new FormData();
            formData.append('is_active', (!currentStatus).toString());

            await axios.put(
                `http://localhost:8000/admin/users/${userId}/status`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_active: !currentStatus } : user
            ));
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error al actualizar el estado del usuario');
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users size={24} className="text-[#1B4D3E]" />
                    Gestión de Usuarios
                </h3>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-[#1B4D3E]" size={48} />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1B4D3E] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Usuario</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-center">Compras</th>
                                <th className="px-4 py-3 text-left">Fecha Registro</th>
                                <th className="px-4 py-3 text-center">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-600">{user.id}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">{user.username}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.email || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full font-bold">
                                            {user.purchases}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                <CheckCircle size={16} />
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                <XCircle size={16} />
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                                            disabled={updatingUserId === user.id}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${user.is_active
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {updatingUserId === user.id ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : user.is_active ? (
                                                'Desactivar'
                                            ) : (
                                                'Activar'
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron usuarios
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagementTable;
