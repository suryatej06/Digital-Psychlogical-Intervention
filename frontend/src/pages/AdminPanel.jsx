import { useState, useEffect } from 'react';
import { adminAPI, resourcesAPI } from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedSessions, setFlaggedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'article',
    category: '',
    url: '',
    thumbnail: ''
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'resources') {
      loadResources();
    } else if (activeTab === 'posts') {
      loadFlaggedPosts();
    } else if (activeTab === 'sessions') {
      loadFlaggedSessions();
    }
  }, [activeTab]);

  const loadResources = async () => {
    try {
      const response = await resourcesAPI.getAll({});
      setResources(response.resources ?? []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
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

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await resourcesAPI.create(newResource);
      setShowResourceForm(false);
      setNewResource({ title: '', description: '', type: 'article', category: '', url: '', thumbnail: '' });
      loadResources();
      loadDashboardStats();
    } catch (error) {
      console.error('Failed to create resource:', error);
      alert(error.response?.data?.message || 'Failed to create resource');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Remove this resource? It will be hidden from students.')) return;
    try {
      await resourcesAPI.delete(id);
      loadResources();
      loadDashboardStats();
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const tabs = [
    { id: 'stats', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'resources', label: 'Resources' },
    { id: 'posts', label: 'Flagged Posts' },
    { id: 'sessions', label: 'Flagged Sessions' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading && activeTab === 'stats' ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {activeTab === 'stats' && stats && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Students: {stats.users.students}</p>
                  <p>Counselors: {stats.users.counselors}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Resources</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.resources.total}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Community Posts</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.community.totalPosts}</p>
                <p className="text-sm text-red-600 mt-2">Flagged: {stats.community.flaggedPosts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bookings</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.bookings.total}</p>
                <p className="text-sm text-yellow-600 mt-2">Pending: {stats.bookings.pending}</p>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Upload & manage resources</h2>
                <button
                  onClick={() => setShowResourceForm(!showResourceForm)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  {showResourceForm ? 'Cancel' : 'Add resource'}
                </button>
              </div>
              {showResourceForm && (
                <form onSubmit={handleCreateResource} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      >
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. Anxiety, Sleep"
                        value={newResource.category}
                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                    <input
                      type="url"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://..."
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://..."
                      value={newResource.thumbnail}
                      onChange={(e) => setNewResource({ ...newResource, thumbnail: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    Create resource
                  </button>
                </form>
              )}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No resources yet. Add one above.</td></tr>
                    ) : (
                      resources.map((r) => (
                        <tr key={r._id}>
                          <td className="px-6 py-4">{r.title}</td>
                          <td className="px-6 py-4">{r.type}</td>
                          <td className="px-6 py-4">{r.category}</td>
                          <td className="px-6 py-4">
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline mr-4">Open</a>
                            <button onClick={() => handleDeleteResource(r._id)} className="text-red-600 hover:underline">Remove</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          className={`text-sm ${
                            user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              {flaggedPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No flagged posts</div>
              ) : (
                flaggedPosts.map((post) => (
                  <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          By: {post.author?.name || 'Anonymous'} • {new Date(post.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-red-600 mt-1">Flag Reason: {post.flagReason}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {flaggedSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No flagged sessions</div>
              ) : (
                flaggedSessions.map((session) => (
                  <div key={session._id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">User: {session.userId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(session.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-red-600 mt-2">
                          Risk Score: {session.riskScore} • Flag Reason: {session.flagReason}
                        </p>
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
  );
};

export default AdminPanel;
