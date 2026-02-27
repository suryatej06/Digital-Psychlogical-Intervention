import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

/**
 * Create post (Student only)
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, content, isAnonymous } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user.userId,
      authorAlias: isAnonymous ? user.alias : user.name,
      isAnonymous: isAnonymous || false,
      collegeId: req.user.collegeId
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts for user's college
 */
export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      collegeId: req.user.collegeId,
      isActive: true
    })
      .populate('author', 'name alias')
      .sort({ createdAt: -1 });

    // Hide author info if anonymous
    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.isAnonymous) {
        postObj.author = { alias: postObj.authorAlias };
      }
      return postObj;
    });

    res.json({ posts: formattedPosts });
  } catch (error) {
    next(error);
  }
};

/**
 * Get post by ID with comments
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    }).populate('author', 'name alias');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({
      postId: post._id,
      isActive: true
    })
      .populate('author', 'name alias')
      .sort({ createdAt: 1 });

    // Format post and comments
    const postObj = post.toObject();
    if (postObj.isAnonymous) {
      postObj.author = { alias: postObj.authorAlias };
    }

    const formattedComments = comments.map(comment => {
      const commentObj = comment.toObject();
      if (commentObj.isAnonymous) {
        commentObj.author = { alias: commentObj.authorAlias };
      }
      return commentObj;
    });

    res.json({
      post: postObj,
      comments: formattedComments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like/Unlike post
 */
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.userId;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Report post
 */
export const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFlagged = true;
    post.flagReason = reason;
    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete post (Admin only)
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isActive = false;
    await post.save();

    // Also deactivate comments
    await Comment.updateMany(
      { postId: post._id },
      { isActive: false }
    );

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
