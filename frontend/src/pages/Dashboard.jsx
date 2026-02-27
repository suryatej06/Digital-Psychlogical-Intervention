import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-gray-600">
          {user?.college?.name || 'Your Mental Health Support Dashboard'}
        </p>
      </div>

      {user?.role === 'student' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/resources"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-3xl mb-3">📚</div>
            <h3 className="text-xl font-semibold mb-2">Resources</h3>
            <p className="text-gray-600">Access mental health resources</p>
          </Link>

          <Link
            to="/community"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-3xl mb-3">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">Connect with peers</p>
          </Link>

          <Link
            to="/chatbot"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-3xl mb-3">💬</div>
            <h3 className="text-xl font-semibold mb-2">Chatbot</h3>
            <p className="text-gray-600">Get instant support</p>
          </Link>

          <Link
            to="/bookings"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-3xl mb-3">📅</div>
            <h3 className="text-xl font-semibold mb-2">Bookings</h3>
            <p className="text-gray-600">Schedule counseling</p>
          </Link>
        </div>
      )}

      {user?.role === 'counselor' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Counselor Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Manage your bookings and availability from here.
          </p>
          <Link
            to="/bookings"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            View My Bookings
          </Link>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Manage users, resources, and monitor flagged content.
          </p>
          <Link
            to="/admin"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
