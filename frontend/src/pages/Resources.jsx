import { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;

      const response = await resourcesAPI.getAll(params);
      const list = response.resources ?? [];
      setResources(list);

      // Extract unique categories
      const uniqueCategories = [...new Set(list.map(r => r.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'audio': return '🎵';
      case 'video': return '🎥';
      case 'article': return '📄';
      default: return '📚';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Resources</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No resources found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource._id} className="group bg-white/70 backdrop-blur-xl 
           border border-white/40
           rounded-3xl shadow-lg 
           overflow-hidden 
           transition-all duration-500 
           hover:shadow-2xl hover:-translate-y-3">
              {resource.thumbnail && (
                <div className="relative">
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{getTypeIcon(resource.type)}</span>
                  <span className="text-sm text-gray-500 uppercase">{resource.type}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="mb-4">
                  <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                    {resource.category}
                  </span>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  View Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
