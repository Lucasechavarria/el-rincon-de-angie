import React from 'react';

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
  theme: 'light' | 'dark';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentPage, totalPages, theme }) => {
  const percentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className={`px-4 py-2 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className={`h-2 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-[#1B4D3E] to-[#D4AF37] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <span className={`text-sm font-semibold min-w-[5rem] text-right ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {currentPage} / {totalPages}
        </span>
      </div>
      <div className={`text-xs mt-1 text-right ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {percentage.toFixed(1)}% completado
      </div>
    </div>
  );
};

export default ProgressBar;
