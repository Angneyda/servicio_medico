"use client";

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const SignInPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    email: '',
    phone: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { login } = useAuth();
  const router = useRouter();
  const motionCurve = 'cubic-bezier(0.77, 0, 0.18, 1)';
  const imageTransition = `opacity 900ms ${motionCurve}, transform 900ms ${motionCurve}`;

  const visualPanelStyle: CSSProperties = {
    left: isRegisterMode ? '50%' : '0%',
    transitionTimingFunction: motionCurve,
    zIndex: isRegisterMode ? 15 : 20,
  };

  const formPanelStyle: CSSProperties = {
    left: isRegisterMode ? '0%' : '50%',
    transitionTimingFunction: motionCurve,
    zIndex: isRegisterMode ? 20 : 15,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('auth/login/', { username, password });
      if (response.data?.user) {
        login(response.data.user);
      }
      router.replace('/dashboard');
    } catch (err: unknown) {
      console.error(err);
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number' &&
        (err as { response: { status: number } }).response.status === 401
      ) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (
    field: keyof typeof registerForm,
    value: string,
  ) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterMessage(null);

    if (registerForm.newPassword !== registerForm.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden');
      return;
    }

    setRegisterLoading(true);
    // Placeholder: aquí se conectará al endpoint real de registro
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setRegisterLoading(false);
    setRegisterMessage('Registro preliminar listo. Completa la activación en el panel de administración.');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute inset-y-8 left-1/2 hidden w-[60%] -translate-x-1/2 rounded-[40px] bg-gradient-to-r from-[#4A86A8]/20 via-transparent to-[#4A86A8]/10 blur-3xl transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.77,0,0.18,1)] md:block" style={{ transform: `translate3d(${isRegisterMode ? '12%' : '-12%'}, 0, 0)`, opacity: isRegisterMode ? 0.9 : 0.6 }} />
      <div className="relative flex min-h-screen flex-col md:block">
        {/* Visual Panel */}
        <div
          className="relative w-full h-64 md:h-full flex flex-col justify-end overflow-hidden transition-[left,transform] duration-[900ms] ease-[cubic-bezier(0.77,0,0.18,1)] md:absolute md:top-0 md:bottom-0 md:w-1/2"
          style={visualPanelStyle}
        >
          <div className="absolute inset-0">
            <Image
              src="/images/cover/fondomedicologuin2.jpeg"
              alt="Profesional de la salud registrando"
              fill
              className="object-cover"
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              style={{
                opacity: isRegisterMode ? 1 : 0,
                transform: isRegisterMode ? 'scale(1)' : 'scale(1.04)',
                transition: imageTransition,
              }}
            />
            <Image
              src="/images/cover/fondomedicologuin3.jpeg"
              alt="Profesional de la salud ingresando"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="eager"
              priority
              style={{
                opacity: isRegisterMode ? 0 : 1,
                transform: isRegisterMode ? 'scale(1.04)' : 'scale(1)',
                transition: imageTransition,
              }}
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 20% 50%, rgba(74,134,168,0.18) 0%, rgba(74,134,168,0.45) 60%, rgba(74,134,168,0.85) 100%)',
              transform: isRegisterMode ? 'translateX(-2%) scale(1.02)' : 'translateX(2%) scale(1)',
              transition: `transform 900ms ${motionCurve}`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center pb-10 text-center px-6">
          <div className="bg-white/80 rounded-full px-6 py-2 mb-3 shadow-md">
            <span className="text-3xl font-bold text-[#4A86A8] tracking-wide">
              SISMED
            </span>
          </div>
          <span className="text-white text-base font-light">
            Sistema de Servicio Medico
          </span>
          <p className="mt-4 text-white/80 text-sm max-w-sm">
            {isRegisterMode
              ? 'Completa los datos básicos de usuario y persona para solicitar acceso.'
              : 'Bienvenido. Ingresa con tu usuario para acceder al panel.'}
          </p>
        </div>
        </div>

        {/* Dynamic Form Panel */}
        <div
          className={`w-full flex items-center justify-center bg-white py-12 px-6 md:px-16 transition-[left,transform,box-shadow] duration-[900ms] ease-[cubic-bezier(0.77,0,0.18,1)] ${
            isRegisterMode ? 'bg-gradient-to-b from-white via-slate-50 to-white' : ''
          } md:absolute md:top-0 md:bottom-0 md:w-1/2`}
          style={formPanelStyle}
        >
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/cover/logo-conatel-medico.jpeg"
                alt="Servicio Médico CONATEL"
                width={220}
                height={120}
                className="h-32 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-[#1e3a8a] text-center">
              {isRegisterMode ? 'Solicitud de Registro' : 'Iniciar sesión'}
            </h1>
          </div>

          {isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {registerMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md px-3 py-2">
                  {registerMessage}
                </div>
              )}
              {registerError && (
                <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-md px-3 py-2">
                  {registerError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => handleRegisterChange('firstName', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => handleRegisterChange('lastName', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cédula</label>
                  <input
                    type="text"
                    value={registerForm.cedula}
                    onChange={(e) => handleRegisterChange('cedula', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => handleRegisterChange('phone', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Correo</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => handleRegisterChange('email', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Usuario</label>
                  <input
                    type="text"
                    value={registerForm.newUsername}
                    onChange={(e) => handleRegisterChange('newUsername', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    value={registerForm.newPassword}
                    onChange={(e) => handleRegisterChange('newPassword', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#4A86A8] focus:ring-[#4A86A8] bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold text-base shadow hover:bg-emerald-600 transition disabled:opacity-60"
              >
                {registerLoading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="w-full py-3 rounded-lg border border-[#4169E1] text-[#4169E1] font-semibold text-base hover:bg-[#4169E1]/5 transition"
              >
                Ya tengo una cuenta
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#4A86A8] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#4169E1] text-white font-semibold text-base shadow transition disabled:opacity-60 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              <div className="flex items-center justify-center">
                <span className="text-gray-400 text-xs">o</span>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="w-full py-3 rounded-lg bg-[#4169E1] text-white font-semibold text-base shadow transition hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                Nuevo Registro
              </button>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
