// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const { role, hasCompletedOnboarding } = result.user;
      if (role === 'admin') navigate('/admin');
      else if (role === 'student' && !hasCompletedOnboarding) navigate('/onboarding');
      else navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
            🧠
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border-2 border-white bg-white/60 text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border-2 border-white bg-white/60 text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-md transition-all duration-200 ${loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition">
              Create one here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          This platform is not a substitute for professional mental health care.
        </p>
      </div>
    </div>
  );
};

export default Login;