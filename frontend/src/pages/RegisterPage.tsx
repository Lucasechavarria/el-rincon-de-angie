import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Book, Feather, Mail, Lock, User, Sparkles } from 'lucide-react';
import { AnimatedPage } from '../components/ui/AnimatedPage';
import { Turnstile } from '@marsidev/react-turnstile';
import { motion } from 'framer-motion';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
      // 1. Register User
      await axios.post('http://localhost:8000/users/', {
        username: username.trim(),
        email: email.trim(),
        password: password.trim()
      }, {
        headers: { 'X-Turnstile-Token': turnstileToken }
      });

      // 2. Automatically Login
      const loginResponse = await axios.post(
        'http://localhost:8000/token',
        new URLSearchParams({
          username: username.trim(),
          password: password.trim(),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Turnstile-Token': turnstileToken
          }
        }
      );

      const { access_token, is_admin } = loginResponse.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('is_admin', JSON.stringify(is_admin));
      
      // Redirect based on role
      navigate(is_admin ? '/admin' : '/mis-libros');

    } catch (err: any) {
      console.error('[RegisterPage] Error:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Error al registrarse. El usuario o email ya podrían estar en uso.');
      } else {
        setError('Error de conexión. Intenta de nuevo más tarde.');
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
      <div className="absolute top-10 right-10 text-[#D4AF37]/10">
        <Sparkles size={150} />
      </div>
      
      <div className="w-full max-w-md p-1 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F5DC] rounded-2xl shadow-2xl overflow-hidden border-4 border-[#D4AF37]/50"
        >
          {/* Header */}
          <div className="bg-[#1B4D3E] p-8 text-center relative">
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-bold text-[#D4AF37] mb-2">Crear Cuenta</h1>
              <p className="text-[#F5F5DC]/60 text-xs uppercase tracking-widest">Únete a El Rincón de Angie</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#1B4D3E]/10 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} /> Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#1B4D3E]/10 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="ejemplo@correo.com"
                  required
                />
                <p className="text-[10px] text-[#1B4D3E]/40 italic">Usa el mismo correo si realizaste compras como invitado.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider flex items-center gap-2">
                  <Lock size={14} /> Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#1B4D3E]/10 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey="1x00000000000000000000AA"
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1B4D3E] text-[#D4AF37] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creando cuenta...' : 'Comenzar mi colección'}
                {!loading && <Feather size={18} />}
              </button>

              <p className="text-center text-xs text-[#1B4D3E]/60 pt-4">
                ¿Ya tienes cuenta? <Link to="/login" className="text-[#D4AF37] font-bold hover:underline">Inicia Sesión</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default RegisterPage;
