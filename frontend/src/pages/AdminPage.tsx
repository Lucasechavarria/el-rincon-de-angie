import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadForm from '../components/admin/UploadForm';
import DashboardStats from '../components/admin/DashboardStats';
import SalesChart from '../components/admin/SalesChart';
import PopularBooksTable from '../components/admin/PopularBooksTable';
import UserGrowthChart from '../components/admin/UserGrowthChart';
import ExportButton from '../components/admin/ExportButton';
import UserManagementTable from '../components/admin/UserManagementTable';
import AdminNewsletterPanel from '../components/admin/AdminNewsletterPanel';
import { BarChart3, Upload, Shield, Loader2, Users, TrendingUp, Mail, Lock } from 'lucide-react';
import { useGlobalStore } from '../stores/useGlobalStore';
import { AnimatedPage } from '../components/ui/AnimatedPage';

type TabType = 'dashboard' | 'analytics' | 'users' | 'newsletter' | 'upload';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('access_token');
  const { theme } = useGlobalStore();

  useEffect(() => {
    const checkRole = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:8000/users/me/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAdmin(res.data.is_admin);
      } catch (e) {
        console.error('Error checking user role', e);
      }
    };
    checkRole();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'analytics' && isAdmin) {
      fetchAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, period, isAdmin]);

  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      if (isAdmin) {
        const [statsRes, salesRes, booksRes] = await Promise.all([
          axios.get('http://localhost:8000/admin/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8000/admin/analytics/sales?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/admin/analytics/books/popular', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setStats(statsRes.data);
        setSalesData(salesRes.data);
        setPopularBooks(booksRes.data);
      } else {
        // Guest/Normal user mode - limited dashboard view
        const [booksRes] = await Promise.all([
          axios.get('http://localhost:8000/admin/analytics/books/popular', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setPopularBooks(booksRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [salesRes, growthRes] = await Promise.all([
        axios.get(`http://localhost:8000/admin/analytics/sales?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/admin/analytics/users/growth?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSalesData(salesRes.data);
      setUserGrowthData(growthRes.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Theme configuration styles
  const bgMain = theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]';
  const textMain = theme === 'dark' ? 'text-gray-100' : 'text-[#1B4D3E]';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const headerBg = theme === 'dark' ? 'bg-[#153e32]' : 'bg-[#1B4D3E]';
  const tabActiveColor = theme === 'dark' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-[#1B4D3E] border-[#D4AF37]';
  const tabInactiveColor = theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-[#1B4D3E]/50 hover:text-[#1B4D3E]';

  return (
    <AnimatedPage className={`min-h-screen ${bgMain} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className={`inline-flex items-center justify-center p-3 ${headerBg} rounded-full text-[#D4AF37] mb-4 shadow-lg border border-[#D4AF37]/20`}>
            {isAdmin ? <Shield size={32} /> : <Lock size={32} />}
          </div>
          <h1 className={`text-4xl font-serif font-bold ${textMain} mb-2`}>
            {isAdmin ? 'Panel de Administración' : 'Panel de Escritorio (Guest Mode)'}
          </h1>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b-2 ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/20'} overflow-x-auto`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'dashboard' ? tabActiveColor : 'border-transparent ' + tabInactiveColor}`}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'analytics' ? tabActiveColor : 'border-transparent ' + tabInactiveColor}`}
              >
                <TrendingUp size={20} />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'users' ? tabActiveColor : 'border-transparent ' + tabInactiveColor}`}
              >
                <Users size={20} />
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('newsletter')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'newsletter' ? tabActiveColor : 'border-transparent ' + tabInactiveColor}`}
              >
                <Mail size={20} />
                Newsletter
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'upload' ? tabActiveColor : 'border-transparent ' + tabInactiveColor}`}
          >
            <Upload size={20} />
            Subir Libro
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className={`animate-spin ${theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#1B4D3E]'}`} size={48} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards - Admin Only */}
              {isAdmin && stats && <DashboardStats stats={stats} />}

              {isAdmin && (
                <div className="flex justify-end">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={`px-4 py-2 border-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-[#1B4D3E]/20 bg-white text-[#1B4D3E]'} rounded-lg focus:outline-none focus:border-[#D4AF37]`}
                  >
                    <option value="day">Últimos 7 días</option>
                    <option value="week">Últimas 12 semanas</option>
                    <option value="month">Últimos 12 meses</option>
                  </select>
                </div>
              )}

              {/* Sales Chart - Admin Only */}
              {isAdmin && <SalesChart data={salesData} period={period} />}

              {/* Popular Books Table - Available for all */}
              <div className={`${cardBg} rounded-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/10'} overflow-hidden p-1`}>
                <PopularBooksTable books={popularBooks} />
              </div>
            </div>
          )
        )}

        {activeTab === 'analytics' && isAdmin && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className={`animate-spin ${theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#1B4D3E]'}`} size={48} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Export Button */}
              <div className="flex justify-end">
                {token && <ExportButton token={token} />}
              </div>

              {/* Period Selector */}
              <div className="flex justify-end">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className={`px-4 py-2 border-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-[#1B4D3E]/20 bg-white text-[#1B4D3E]'} rounded-lg focus:outline-none focus:border-[#D4AF37]`}
                >
                  <option value="day">Últimos 7 días</option>
                  <option value="week">Últimas 12 semanas</option>
                  <option value="month">Últimos 12 meses</option>
                </select>
              </div>

              {/* Charts */}
              <div className={`${cardBg} rounded-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/10'} overflow-hidden p-4`}>
                <SalesChart data={salesData} period={period} />
              </div>
              <div className={`${cardBg} rounded-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/10'} overflow-hidden p-4`}>
                <UserGrowthChart data={userGrowthData} period={period} />
              </div>
            </div>
          )
        )}

        {activeTab === 'users' && isAdmin && (
          <div className={`${cardBg} rounded-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/10'} overflow-hidden p-4`}>
            {token && <UserManagementTable token={token} />}
          </div>
        )}

        {activeTab === 'newsletter' && isAdmin && (
          <div className={`${cardBg} rounded-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/10'} overflow-hidden p-4`}>
            {token && <AdminNewsletterPanel token={token} />}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className={`${cardBg} rounded-lg shadow-xl overflow-hidden border-t-4 border-[#D4AF37]`}>
            <div className={`${headerBg}/5 p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-[#1B4D3E]/10'}`}>
              <h2 className={`text-2xl font-serif font-bold ${textMain}`}>
                Nueva Publicación
              </h2>
            </div>
            <div className="p-8">
              <UploadForm />
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default AdminPage;
