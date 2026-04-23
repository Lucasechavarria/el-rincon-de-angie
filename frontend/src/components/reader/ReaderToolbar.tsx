import React from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, Maximize, Minimize, Bookmark } from 'lucide-react';

interface ReaderToolbarProps {
  theme: 'light' | 'dark';
  zoom: number;
  isFullscreen: boolean;
  onThemeToggle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreenToggle: () => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
}

const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  theme,
  zoom,
  isFullscreen,
  onThemeToggle,
  onZoomIn,
  onZoomOut,
  onFullscreenToggle,
  onBookmarkToggle,
  isBookmarked,
}) => {
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-yellow-400'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l border-r px-2 mx-2"
             style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Alejar"
          >
            <ZoomOut size={20} />
          </button>
          <span className={`text-sm font-semibold min-w-[3rem] text-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 2}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Acercar"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={onBookmarkToggle}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-yellow-500'
              : theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={isBookmarked ? 'Quitar marcador' : 'Agregar marcador'}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Fullscreen Toggle */}
      <button
        onClick={onFullscreenToggle}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
};

export default ReaderToolbar;
