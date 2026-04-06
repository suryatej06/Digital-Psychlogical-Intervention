// frontend/src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collegesAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    collegeId: '',
    alias: '',
  });
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    collegesAPI.getAll()
      .then(res => setColleges(res.colleges ?? res ?? []))
      .catch(() => { });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    if (!formData.collegeId) return setError('Please select a college');

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      const role = result.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'counselor') navigate('/bookings');
      else navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
    setLoading(false);
  };

  // Shared input class
  const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-white bg-white/60 text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-200";
  const labelCls = "block text-sm font-bold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
            🧠
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-500 text-sm">Join your college's mental health platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full name */}
            <div>
              <label htmlFor="name" className={labelCls}>Full name</label>
              <input
                id="name" name="name" type="text" required
                placeholder="Your full name"
                value={formData.name} onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelCls}>Email address</label>
              <input
                id="email" name="email" type="email" required
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Role + College — side by side on sm+ */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className={labelCls}>Role</label>
                <select
                  id="role" name="role" required
                  value={formData.role} onChange={handleChange}
                  className={inputCls}
                >
                  <option value="student">Student</option>
                  <option value="counselor">Counselor</option>
                </select>
              </div>

              <div>
                <label htmlFor="collegeId" className={labelCls}>College</label>
                <select
                  id="collegeId" name="collegeId" required
                  value={formData.collegeId} onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Select college</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alias */}
            <div>
              <label htmlFor="alias" className={labelCls}>
                Alias{' '}
                <span className="text-gray-400 font-normal">(optional — for anonymous posts)</span>
              </label>
              <input
                id="alias" name="alias" type="text"
                placeholder="Leave empty to use your first name"
                value={formData.alias} onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Password + Confirm — side by side on sm+ */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelCls}>Password</label>
                <input
                  id="password" name="password" type="password" required
                  placeholder="Min 6 characters"
                  value={formData.password} onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelCls}>Confirm password</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required
                  placeholder="Repeat password"
                  value={formData.confirmPassword} onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-md transition-all duration-200 ${loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                }`}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          This platform is not a substitute for professional mental health care.
        </p>
      </div>
    </div>
  );
};

export default Register;