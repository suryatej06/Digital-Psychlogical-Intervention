import { useState, useEffect } from 'react';
import { postsAPI, commentsAPI } from '../services/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', isAnonymous: false });
  const [newComment, setNewComment] = useState({ content: '', isAnonymous: false });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll();
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      const response = await postsAPI.getById(postId);
      setSelectedPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post details:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await postsAPI.create(newPost);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', isAnonymous: false });
      fetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await commentsAPI.create(selectedPost.post._id, newComment);
      setNewComment({ content: '', isAnonymous: false });
      fetchPostDetails(selectedPost.post._id);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.toggleLike(postId);
      fetchPosts();
      if (selectedPost && selectedPost.post._id === postId) {
        fetchPostDetails(postId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleReport = async (postId) => {
    const reason = prompt('Please provide a reason for reporting this post:');
    if (reason) {
      try {
        await postsAPI.report(postId, reason);
        alert('Post reported successfully');
      } catch (error) {
        console.error('Failed to report post:', error);
        alert(error.response?.data?.message || 'Failed to report post');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Create Post
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No posts yet. Be the first to share!
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                    onClick={() => fetchPostDetails(post._id)}
                  >
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {post.isAnonymous ? post.authorAlias : post.author?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post._id);
                          }}
                          className="text-gray-500 hover:text-primary-600"
                        >
                          ❤️ {post.likes?.length || 0}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReport(post._id);
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPost && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">{selectedPost.post.title}</h2>
              <p className="text-gray-600 mb-4">{selectedPost.post.content}</p>
              <div className="mb-6">
                <span className="text-sm text-gray-500">
                  By {selectedPost.post.isAnonymous ? selectedPost.post.authorAlias : selectedPost.post.author?.name}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Comments</h3>
                <form onSubmit={handleAddComment} className="mb-4">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Add a comment..."
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    required
                  />
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={newComment.isAnonymous}
                      onChange={(e) => setNewComment({ ...newComment, isAnonymous: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Post anonymously</span>
                  </label>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Add Comment
                  </button>
                </form>

                <div className="space-y-3">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment._id} className="border-l-2 border-gray-200 pl-4">
                      <p className="text-gray-700">{comment.content}</p>
                      <span className="text-sm text-gray-500">
                        {comment.isAnonymous ? comment.authorAlias : comment.author?.name} •{' '}
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="6"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                />
              </div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={newPost.isAnonymous}
                  onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                  className="mr-2"
                />
                <span>Post anonymously</span>
              </label>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
