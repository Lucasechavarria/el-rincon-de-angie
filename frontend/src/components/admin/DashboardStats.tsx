import React from 'react';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    total_users: number;
    total_books: number;
    monthly_sales: number;
    total_revenue: number;
    monthly_revenue: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.total_users,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Libros',
      value: stats.total_books,
      icon: BookOpen,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Ventas del Mes',
      value: stats.monthly_sales,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.total_revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow"
          style={{ borderColor: card.color.replace('bg-', '#') }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon className={card.textColor} size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">{card.title}</h3>
          <p className="text-3xl font-bold text-gray-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
