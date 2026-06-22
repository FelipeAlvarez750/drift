import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sileo } from 'sileo';
import api from '../services/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      sileo.success({ title: '¡Cuenta creada!', description: `Bienvenido a Drift, ${res.data.user.name}` });
      navigate('/dashboard');
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo crear la cuenta. Intenta con otro email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">drift</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Organiza tu flujo de trabajo</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-100 dark:shadow-none">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Crear cuenta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: undefined }); }}
                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  errors.name ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                placeholder="Tu nombre completo"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  errors.email ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  errors.password ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium transition">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}