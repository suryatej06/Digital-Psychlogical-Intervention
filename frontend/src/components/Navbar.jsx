import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#282455]/85 backdrop-blur-xl border-b border-indigo-800/50 text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-xl transition-all duration-300">
      <Link to="/" className="font-extrabold text-2xl tracking-tight flex items-center gap-2 drop-shadow-md">
        <span className="text-2xl">🧠</span> MindSpace
      </Link>

      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="hover:text-indigo-300 transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors shadow-md shadow-indigo-900/50"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            {/* Student nav */}
            {user?.role === 'student' && (
              <>
                <Link to="/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all font-medium">
                  Home
                </Link>
                <Link to="/resources" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all font-medium">
                  Resources
                </Link>
                <Link to="/community" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all font-medium">
                  Community
                </Link>
                <Link to="/connect" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all font-medium">
                  Connect
                </Link>
                <Link to="/chatbot" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-purple-200 hover:text-white transition-all font-extrabold tracking-wide flex items-center gap-1 shadow-sm">
                  Chatbot ✨
                </Link>
                <Link to="/check-in" className="px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-100 transition-all font-bold">
                  Check-In
                </Link>
                <Link to="/progress" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all font-medium">
                  My Progress
                </Link>
              </>
            )}

            {/* Counselor nav */}
            {user?.role === 'counselor' && (
              <>
                <Link to="/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all">
                  Dashboard
                </Link>
                <Link to="/connect" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all">
                  Connect
                </Link>
                <Link to="/manage-resources" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all">
                  Manage Resources
                </Link>
              </>
            )}

            {/* Admin nav */}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all">
                  Admin Panel
                </Link>
                <Link to="/manage-resources" className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-indigo-200 transition-all">
                  Manage Resources
                </Link>
              </>
            )}

            <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-all font-bold"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
