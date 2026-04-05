import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-indigo-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <Link to="/" className="font-bold text-lg tracking-tight">
        MindSpace
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="hover:text-indigo-200 transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            {/* Student nav */}
            {user?.role === 'student' && (
              <>
                <Link to="/resources" className="hover:text-indigo-200 transition-colors">
                  Resources
                </Link>
                <Link to="/community" className="hover:text-indigo-200 transition-colors">
                  Community
                </Link>
                <Link to="/chatbot" className="hover:text-indigo-200 transition-colors">
                  Chatbot
                </Link>
                <Link to="/bookings" className="hover:text-indigo-200 transition-colors">
                  Bookings
                </Link>
                <Link to="/assessment" className="hover:text-indigo-200 transition-colors">
                  Assessment
                </Link>
                <Link to="/results" className="hover:text-indigo-200 transition-colors">
                  History
                </Link>
              </>
            )}

            {/* Counselor nav */}
            {user?.role === 'counselor' && (
              <>
                <Link to="/bookings" className="hover:text-indigo-200 transition-colors">
                  My Sessions
                </Link>
              </>
            )}

            {/* Admin nav */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-indigo-200 transition-colors">
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="ml-2 text-indigo-300 hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}