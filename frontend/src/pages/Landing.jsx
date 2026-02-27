import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Mental Health Support Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A safe, supportive space for students to access mental health resources,
            connect with counselors, and find community support.
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-primary-600"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">AI Chatbot Support</h3>
            <p className="text-gray-600">
              Get instant support from our AI-powered chatbot, available 24/7
              to help you navigate difficult moments.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
            <p className="text-gray-600">
              Connect with peers, share experiences, and find support in our
              anonymous community space.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Resources Library</h3>
            <p className="text-gray-600">
              Access curated articles, videos, and audio resources on mental
              health and wellness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
