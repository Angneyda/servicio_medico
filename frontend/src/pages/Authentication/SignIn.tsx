import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaCapsules } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import fondoMedico from '../../images/cover/fondomedicologuin.jpeg';

const SignIn: React.FC = () => {
    // Estado para el formulario
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
  
    // Hook de autenticacion
    const { login } = useAuth();
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        // Asumiendo que usas Django Simple JWT y tu endpoint es /api/token/
        // Ojo: api.js ya tiene baseURL, asi que solo ponemos 'token/'
        const response = await api.post('token/', { username, password });
        
        // login guarda en localStorage y actualiza el contexto
        login(response.data.access, response.data.refresh);
        
        // Redirigir al dashboard
        navigate('/'); 
      } catch (err: any) {
        console.error(err);
        if (err.response && err.response.status === 401) {
            setError('Usuario o contraseña incorrectos');
        } else {
            setError('Error de conexión con el servidor');
        }
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Columna Izquierda: Visual */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto flex flex-col justify-end">
          <img
            src={fondoMedico}
            alt="Profesional de la salud"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 20% 50%, rgba(74,134,168,0.18) 0%, rgba(74,134,168,0.45) 60%, rgba(74,134,168,0.85) 100%)',
            }}
          />
          <div className="relative z-10 flex flex-col items-center pb-10">
            <div className="bg-white/80 rounded-full px-6 py-2 mb-3 shadow-md">
              <span className="text-3xl font-bold text-[#4A86A8] tracking-wide">SISMED</span>
            </div>
            <span className="text-white text-sm md:text-base font-light">
              Empoderando la salud, un clic a la vez
            </span>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white py-12 px-6 md:px-16">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center mb-8">
              {/* <FaCapsules className="text-[#4A86A8] text-3xl mb-2" /> */}
              <h1 className="text-4xl font-bold text-[#4A86A8]">Iniciar sesión</h1>
              <p className="text-gray-500 mt-1">Ingresa a tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50 placeholder-gray-400 outline-none"
                  placeholder="jcabrices"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50 placeholder-gray-400 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-[#4A86A8] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#4A86A8] text-white font-semibold text-base shadow hover:bg-[#41749a] transition disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              <div className="flex items-center justify-center">
                <span className="text-gray-400 text-xs">o</span>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              >
                <FcGoogle className="text-xl" /> Login con Google
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default SignIn;
