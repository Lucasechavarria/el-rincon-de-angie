import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useGlobalStore } from '../../stores/useGlobalStore';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  className = ""
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useGlobalStore();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/categories', {
        timeout: 5000 
      });
      setCategories(response.data);
    } catch (err: any) {
      console.error('[CategoryFilter] Error fetching categories:', err);
      const errorMessage = err.code === 'ECONNABORTED'
        ? 'Tiempo de espera agotado.'
        : 'No se pudieron cargar las categorías.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Filter size={18} />;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={18} /> : <Filter size={18} />;
  };

  const handleCategoryClick = (categoryId: number) => {
    onCategoryChange(selectedCategory === categoryId ? null : categoryId);
  };

  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 shadow-none' : 'bg-white border-[#D4AF37]/20 shadow-md';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-[#1B4D3E]';
  const itemBgDefault = theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-[#F5F5DC] hover:bg-[#1B4D3E]/10';
  const itemBgActive = theme === 'dark' ? 'bg-[#D4AF37] text-[#1B4D3E]' : 'bg-[#1B4D3E] text-[#F5F5DC]';

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl p-4 border transition-all duration-500`}>
        <div className="flex items-center gap-3">
          <div className={`animate-spin rounded-full h-5 w-5 border-2 ${theme === 'dark' ? 'border-[#D4AF37]' : 'border-[#1B4D3E]'} border-t-transparent`}></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#1B4D3E]/70'}>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden w-full flex items-center justify-between ${cardBg} rounded-xl p-4 mb-4 transition-all`}
      >
        <span className={`flex items-center gap-2 ${textPrimary} font-bold`}>
          <Filter size={20} className="text-[#D4AF37]" />
          Filtrar por categoría
        </span>
        {selectedCategory && (
          <span className="bg-[#D4AF37] text-[#1B4D3E] px-3 py-1 rounded-full text-xs font-black shadow-inner">
            1
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <div className={`${cardBg} rounded-xl p-6 border transition-all duration-500 ${isOpen ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-serif font-bold ${textPrimary} flex items-center gap-3`}>
            <Filter size={22} className="text-[#D4AF37]" />
            Categorías
          </h3>
          {selectedCategory && (
            <button
              onClick={() => onCategoryChange(null)}
              className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-medium border-2 
                ${selectedCategory === category.id
                  ? `${itemBgActive} border-[#D4AF37] shadow-lg scale-[1.02]`
                  : `${itemBgDefault} border-transparent text-inherit`
                }`}
            >
              <span className={selectedCategory === category.id ? 'text-[#1B4D3E]' : 'text-[#D4AF37]'}>
                {getIcon(category.icon)}
              </span>
              <span className={`flex-1 text-left ${theme === 'dark' && selectedCategory !== category.id ? 'text-white' : ''}`}>
                {category.name}
              </span>
              {selectedCategory === category.id && (
                <span className="font-black">✓</span>
              )}
            </button>
          ))}
        </div>

        {categories.length === 0 && !error && (
          <p className="text-gray-500 text-center py-6 italic">
            No hay categorías disponibles
          </p>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={fetchCategories} className="text-[#D4AF37] text-xs font-bold uppercase tracking-tighter hover:underline">
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
