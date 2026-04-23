import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useGlobalStore } from '../../stores/useGlobalStore';

const Layout: React.FC = () => {
  const { theme } = useGlobalStore();
  
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5DC]';

  return (
    <div className={`flex min-h-screen ${bgClass} transition-colors duration-500`}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="flex-grow p-6 md:p-12 pt-20 md:pt-12">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;