import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  className?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  className = ""
}) => {
  const sortOptions = [
    { value: 'created_at-desc', label: 'Más recientes' },
    { value: 'created_at-asc', label: 'Más antiguos' },
    { value: 'title-asc', label: 'Título (A-Z)' },
    { value: 'title-desc', label: 'Título (Z-A)' },
    { value: 'price-asc', label: 'Precio (menor a mayor)' },
    { value: 'price-desc', label: 'Precio (mayor a menor)' },
  ];

  const currentValue = `${sortBy}-${sortOrder}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown size={18} className="text-[#1B4D3E]/70" />
      <select
        value={currentValue}
        onChange={handleChange}
        className="px-4 py-2 border-2 border-[#1B4D3E]/20 rounded-lg 
                   focus:outline-none focus:border-[#D4AF37] transition-colors
                   bg-white text-[#1B4D3E] cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
