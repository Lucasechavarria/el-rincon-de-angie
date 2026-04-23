import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Book, Feather, Lock } from 'lucide-react';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import { Turnstile } from '@marsidev/react-turnstile';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!turnstileToken) {
      setError('Por favor, completa el desafío de seguridad.');
      return;
    }

    setLoading(true);

    try {
      console.log('[LoginPage] Attempting login for user:', username);
      const response = await axios.post(
        'http://localhost:8000/token',
        new URLSearchParams({
          username: username.trim(),
          password: password.trim(),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Turnstile-Token': turnstileToken
          },
          timeout: 5000 // 5 second timeout
        }
      );

      console.log('[LoginPage] Login successful, token received');
      const { access_token, is_admin } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('is_admin', JSON.stringify(is_admin));
      
      console.log('[LoginPage] Token saved, redirecting based on role:', is_admin ? 'Admin' : 'Reader');
      navigate(is_admin ? '/admin' : '/mis-libros');

    } catch (err: any) {
      console.error('[LoginPage] Login error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado. El servidor no responde.');
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Error al iniciar sesión.');
      } else {
        setError('Error de red o del servidor. Verifica que el backend esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="flex items-center justify-center min-h-screen bg-[#1B4D3E] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wall-4-light.png')]"></div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-[#D4AF37]/20 animate-pulse">
        <Feather size={100} />
      </div>
      <div className="absolute bottom-10 right-10 text-[#D4AF37]/20 animate-bounce" style={{ animationDuration: '3s' }}>
        <Book size={120} />
      </div>

      <div className="w-full max-w-md p-1 relative z-10">
        {/* Card Container simulating a book cover */}
        <div className="bg-[#F5F5DC] rounded-lg shadow-2xl overflow-hidden border-4 border-[#D4AF37]/50">
          {/* Header */}
          <div className="bg-[#1B4D3E] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="text-[#1B4D3E]" size={32} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#D4AF37] mb-2">
                El Rincón de Angie
              </h1>
              <p className="text-[#F5F5DC]/80 font-sans text-sm uppercase tracking-widest">
                Acceso Privado
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif"
                >
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50]"
                  required
                  disabled={loading}
                  autoComplete="username"
                  placeholder="Ingrese su usuario"
                  onBlur={() => setUsername(username.trim())}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50]"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-center">
                <Turnstile
                  siteKey="1x00000000000000000000AA"
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'light' }}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 text-center flex items-center justify-center gap-2">
                    <span>⚠️</span> {error}
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#1B4D3E] hover:bg-[#153e32] text-[#D4AF37] font-bold rounded-md transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar al Escritorio</span>
                      <Feather size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-[#1B4D3E]/5 p-6 text-center border-t border-[#1B4D3E]/10 space-y-4">
            <p className="text-xs text-[#1B4D3E]/60 font-serif italic">
              "Las palabras son nuestra fuente más inagotable de magia."
            </p>
            <div className="pt-2">
              <p className="text-xs text-[#1B4D3E]/40">
                ¿Aún no tienes cuenta? <Link to="/register" className="text-[#D4AF37] font-bold hover:underline">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;
