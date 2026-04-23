import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: Array<{
    period: string;
    sales: number;
    revenue: number;
  }>;
  period: string;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, period }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Ventas por {period === 'day' ? 'Día' : period === 'week' ? 'Semana' : 'Mes'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            stroke="#1B4D3E"
            strokeWidth={2}
            name="Ventas"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#D4AF37"
            strokeWidth={2}
            name="Ingresos ($)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
