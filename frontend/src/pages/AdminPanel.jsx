import { useState, useEffect } from 'react';
import { adminAPI, postsAPI } from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedSessions, setFlaggedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'posts') {
      loadFlaggedPosts();
    } else if (activeTab === 'sessions') {
      loadFlaggedSessions();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.users ?? []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadFlaggedPosts = async () => {
    try {
      const response = await adminAPI.getFlaggedPosts();
      setFlaggedPosts(response.posts ?? []);
    } catch (error) {
      console.error('Failed to load flagged posts:', error);
    }
  };

  const loadFlaggedSessions = async () => {
    try {
      const response = await adminAPI.getFlaggedChatSessions();
      setFlaggedSessions(response.sessions ?? []);
    } catch (error) {
      console.error('Failed to load flagged sessions:', error);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // Flagged Content Handlers
  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      await postsAPI.delete(id);
      loadFlaggedPosts();
      if (activeTab === 'stats') loadDashboardStats();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleDismissPostFlag = async (id) => {
    if (!window.confirm("Dismiss this flag? The post will stay online and the flag will be cleared.")) return;
    try {
      await adminAPI.dismissFlaggedPost(id);
      loadFlaggedPosts();
      if (activeTab === 'stats') loadDashboardStats();
    } catch (error) {
      console.error('Failed to dismiss post flag:', error);
    }
  };

  const handleResolveSession = async (id) => {
    if (!window.confirm("Are you sure this crisis session has been addressed and can be marked as resolved?")) return;
    try {
      await adminAPI.resolveChatSession(id);
      loadFlaggedSessions();
      if (activeTab === 'stats') loadDashboardStats();
    } catch (error) {
      console.error('Failed to resolve session:', error);
    }
  };

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Directory', icon: '👥' },
    { id: 'posts', label: 'Flagged Posts', icon: '🚩' },
    { id: 'sessions', label: 'Risk Sessions', icon: '⚠️' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg shrink-0 text-white">
            🛡️
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Control Center</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Manage users, monitor platform health, and resolve flagged content.</p>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 shadow-sm ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-indigo-200/50 scale-105'
                : 'bg-white/70 backdrop-blur-md text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-md'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="slide-in-bottom">
        {loading && activeTab === 'stats' ? (
          <div className="text-center py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            {activeTab === 'stats' && stats && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Users Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Users</h3>
                    <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">👥</span>
                  </div>
                  <p className="text-4xl font-extrabold text-gray-900 mb-4">{stats.users.total}</p>
                  <div className="pt-4 border-t border-gray-100 flex justify-between text-sm font-medium text-gray-500">
                    <span>Students: <strong className="text-gray-900">{stats.users.students}</strong></span>
                    <span>Counselors: <strong className="text-gray-900">{stats.users.counselors}</strong></span>
                  </div>
                </div>

                {/* Resources Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Resources</h3>
                    <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">📚</span>
                  </div>
                  <p className="text-4xl font-extrabold text-gray-900 mb-4">{stats.resources.total}</p>
                  <div className="pt-4 border-t border-gray-100 text-sm font-medium text-emerald-600">
                    Active in learning hub
                  </div>
                </div>

                {/* Community Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Community</h3>
                    <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">💬</span>
                  </div>
                  <p className="text-4xl font-extrabold text-gray-900 mb-4">{stats.community.totalPosts}</p>
                  <div className="pt-4 border-t border-gray-100 flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Total Posts</span>
                    {stats.community.flaggedPosts > 0 ? (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg flex gap-1 items-center">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        {stats.community.flaggedPosts} Flagged
                      </span>
                    ) : (
                      <span className="text-emerald-500">0 Flagged</span>
                    )}
                  </div>
                </div>

                {/* Bookings Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Bookings</h3>
                    <span className="p-2 bg-purple-100 text-purple-600 rounded-xl">🗓️</span>
                  </div>
                  <p className="text-4xl font-extrabold text-gray-900 mb-4">{stats.bookings.total}</p>
                  <div className="pt-4 border-t border-gray-100 flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Platform Sessions</span>
                    {stats.bookings.pending > 0 && (
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{stats.bookings.pending} Pending</span>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Users Directory */}
            {activeTab === 'users' && (
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">User Profile</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Account Status</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-100">
                      {users.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                      ) : users.map((user) => (
                        <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-xl border ${
                              user.role === 'counselor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                              user.role === 'admin' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {user.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                user.isActive 
                                  ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              {user.isActive ? 'Suspend User' : 'Activate User'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Flagged Posts */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {flaggedPosts.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-sm">
                     <span className="text-4xl mb-4 block">✨</span>
                     <h3 className="text-xl font-bold text-gray-800 mb-2">No Flagged Posts</h3>
                     <p className="text-gray-500 font-medium">The community is well-managed and quiet.</p>
                  </div>
                ) : (
                  flaggedPosts.map((post) => (
                    <div key={post._id} className="bg-white/80 backdrop-blur-xl border border-rose-100 p-6 rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-rose-600"></div>
                      
                      <div className="flex justify-between items-start mb-4 pl-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-gray-900">{post.title}</h3>
                            <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-rose-200">
                              Reported
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-500">
                            Posted by: <span className="text-gray-800">{post.author?.name || 'Anonymous'}</span> • {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pl-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-4 whitespace-pre-wrap text-gray-600 text-sm">
                        {post.content}
                      </div>

                      <div className="pl-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold bg-rose-50 px-4 py-2 rounded-xl flex-1">
                          ⚠️ Reason: {post.flagReason || 'Violation of community guidelines'}
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleDismissPostFlag(post._id)}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            Dismiss Flag
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-rose-200/50 transition-all"
                          >
                            Force Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Flagged AI Sessions */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                {flaggedSessions.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-sm">
                     <span className="text-4xl mb-4 block">✅</span>
                     <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Risk Sessions</h3>
                     <p className="text-gray-500 font-medium">AI has not detected any severe risk sessions recently.</p>
                  </div>
                ) : (
                  flaggedSessions.map((session) => (
                    <div key={session._id} className="bg-white/80 backdrop-blur-xl border border-amber-200 p-6 rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600"></div>
                      
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-gray-900">Student AI Chat Review</h3>
                            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                              High Risk
                            </span>
                          </div>
                          <div className="text-sm font-medium mt-2">
                            <p className="text-gray-500">Student: <span className="text-gray-900">{session.userId?.name || 'Unknown'} ({session.userId?.email || 'N/A'})</span></p>
                            <p className="text-gray-500">Chat Started: <span className="text-gray-900">{new Date(session.createdAt).toLocaleString()}</span></p>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div className="text-amber-700 text-sm font-bold bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-100">
                              <span>🚨 Trigger:</span> {session.flagReason || 'Severe keywords detected'}
                            </div>
                            <div className="text-orange-700 text-sm font-bold bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-orange-100">
                              <span>🔥 Risk Score:</span> {session.riskScore}/10
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => handleResolveSession(session._id)}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm text-center hover:shadow-lg hover:shadow-emerald-200/50 transition-all hover:-translate-y-0.5"
                          >
                            Mark Intervened / Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
