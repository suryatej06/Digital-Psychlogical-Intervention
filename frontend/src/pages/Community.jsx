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
      setPosts(response.posts ?? []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      const response = await postsAPI.getById(postId);
      setSelectedPost(response);
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

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.delete(commentId);
      fetchPostDetails(selectedPost.post._id);
    } catch (error) {
      console.error("Failed to delete comment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Community Space
            </h1>
            <p className="text-gray-600 mt-2 font-medium text-lg">Share, connect, and grow together in a safe space.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-xl leading-none block pb-0.5">+</span> Create Post
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-indigo-600 font-bold mt-4 animate-pulse">Loading community...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-sm">
                <span className="text-5xl block mb-4">🌱</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No posts yet</h3>
                <p className="text-gray-500 font-medium text-lg">Be the first to share your thoughts with the community!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Post Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md text-xl">
                          {post.isAnonymous ? '👻' : (post.author?.name?.[0] || 'A').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {post.isAnonymous ? post.authorAlias : post.author?.name || "Anonymous"}
                          </p>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600 mb-2">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-2 hover:text-rose-600 hover:bg-rose-50 bg-white/60 px-5 py-2.5 rounded-xl transition-all shadow-sm border border-white/40"
                      >
                        <span className="text-lg">❤️</span> {post.likes?.length || 0}
                      </button>

                      <button
                        onClick={() => fetchPostDetails(post._id)}
                        className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 bg-white/60 px-5 py-2.5 rounded-xl transition-all shadow-sm border border-white/40"
                      >
                        <span className="text-lg">💬</span> {selectedPost?.post._id === post._id ? 'Close Replies' : 'Replies'}
                      </button>

                      <button
                        onClick={() => handleReport(post._id)}
                        className="flex items-center gap-2 hover:text-amber-600 hover:bg-amber-50 bg-white/60 px-5 py-2.5 rounded-xl ml-auto transition-all shadow-sm border border-white/40"
                      >
                        <span className="text-lg">🚩</span> Report
                      </button>
                    </div>

                    {/* Inline Replies */}
                    {selectedPost?.post._id === post._id && (
                      <div className="mt-8 border-t border-gray-200/60 pt-6 space-y-5 animate-fade-in">
                        {/* Reply Form */}
                        <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3 items-start sm:items-stretch mb-8">
                          <div className="flex-1 w-full">
                            <textarea
                              className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none shadow-inner text-gray-700"
                              placeholder="Write a supportive reply..."
                              rows="2"
                              value={newComment.content}
                              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white px-8 py-4 sm:py-0 rounded-2xl font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all w-full sm:w-auto text-center"
                          >
                            Reply
                          </button>
                        </form>

                        {/* Comments */}
                        <div className="space-y-4">
                          {selectedPost.comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 flex flex-col sm:flex-row sm:justify-between gap-4 group shadow-sm hover:shadow-md transition-all"
                            >
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {comment.isAnonymous ? '👻' : (comment.author?.name?.[0] || 'A').toUpperCase()}
                                  </div>
                                  <span className="font-bold text-gray-900 text-sm">
                                    {comment.isAnonymous ? comment.authorAlias : comment.author?.name || "Anonymous"}
                                  </span>
                                  <span className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-base leading-relaxed pl-11">{comment.content}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-xs font-bold text-red-500 hover:text-red-700 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white/95 backdrop-blur-2xl border border-white/50 p-8 sm:p-10 rounded-3xl max-w-2xl w-full shadow-2xl transform scale-100 transition-transform">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Create New Post</h2>
                  <p className="text-gray-500 font-medium">Share your feelings or ask for advice.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-sm">
                  ✍️
                </div>
              </div>
              
              <form onSubmit={handleCreatePost}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-gray-900 font-medium"
                    placeholder="Briefly, what's on your mind?"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Content
                  </label>
                  <textarea
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-sm text-gray-900 leading-relaxed"
                    rows="6"
                    placeholder="Share more details..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    required
                  />
                </div>
                
                <div className="mb-8 flex items-center justify-between bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                  <div>
                    <p className="font-bold text-indigo-900">Post anonymously</p>
                    <p className="text-xs text-indigo-600/70 font-medium mt-0.5">Hide your real name from others.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={newPost.isAnonymous}
                      onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })} 
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;