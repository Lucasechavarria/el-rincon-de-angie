import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface UserGrowthChartProps {
    data: Array<{
        period: string;
        registrations: number;
    }>;
    period: string;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data, period }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={24} className="text-[#1B4D3E]" />
                Crecimiento de Usuarios por {period === 'day' ? 'Día' : period === 'week' ? 'Semana' : 'Mes'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="registrations"
                        stroke="#1B4D3E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRegistrations)"
                        name="Nuevos Usuarios"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserGrowthChart;
