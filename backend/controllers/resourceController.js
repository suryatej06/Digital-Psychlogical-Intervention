import Resource from '../models/Resource.js';

/**
 * Create resource (Admin only)
 */
export const createResource = async (req, res, next) => {
  try {
    const { title, description, type, category, url, thumbnail } = req.body;

    if (!title || !type || !category || !url) {
      return res.status(400).json({ message: 'Title, type, category, and URL are required' });
    }

    if (!['audio', 'video', 'article'].includes(type)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      category,
      url,
      thumbnail,
      collegeId: req.user.collegeId,
      createdBy: req.user.userId
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all resources for user's college
 */
export const getResources = async (req, res, next) => {
  try {
    const { type, category } = req.query;
    const filter = {
      collegeId: req.user.collegeId,
      isActive: true
    };

    if (type) filter.type = type;
    if (category) filter.category = category;

    const resources = await Resource.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    next(error);
  }
};

/**
 * Get resource by ID
 */
export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    }).populate('createdBy', 'name');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ resource });
  } catch (error) {
    next(error);
  }
};

/**
 * Update resource (Admin only)
 */
export const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    Object.assign(resource, req.body);
    await resource.save();

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resource (Admin only)
 */
export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.isActive = false;
    await resource.save();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};
