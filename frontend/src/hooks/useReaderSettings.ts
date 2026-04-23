import { useState, useEffect } from 'react';

interface ReaderSettings {
  theme: 'light' | 'dark';
  zoom: number;
  lastPage: number;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  zoom: 1,
  lastPage: 1,
};

export const useReaderSettings = (bookId: number, userId: number | null) => {
  const storageKey = `reader_settings_${bookId}_${userId || 'guest'}`;
  
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateZoom = (zoom: number) => {
    setSettings(prev => ({ ...prev, zoom: Math.max(0.5, Math.min(2, zoom)) }));
  };

  const updateLastPage = (page: number) => {
    setSettings(prev => ({ ...prev, lastPage: page }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(storageKey);
  };

  return {
    settings,
    updateTheme,
    updateZoom,
    updateLastPage,
    resetSettings,
  };
};
