import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Añadir más estado global aquí según sea necesario (ej. preferencias de usuario)
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'rincon-angie-storage', // nombre de la key en localStorage
    }
  )
);
