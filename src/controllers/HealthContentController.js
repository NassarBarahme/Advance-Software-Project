const HealthContentModel = require('../models/HealthContentModel');
const ResponseHelper = require('../utils/responseHelper');

class HealthContentController {
  
  static async createContent(req, res) {
    try {
      const {
        title,
        content_type,
        category,
        content_text,
        content_url,
        language,
        target_audience,
        is_published
      } = req.body;

   
      if (!title || !content_type || !category) {
        return ResponseHelper.error(res, 'Title, content_type, and category are required', 400);
      }

      const validContentTypes = ['article', 'video', 'infographic', 'guide', 'webinar'];
      if (!validContentTypes.includes(content_type)) {
        return ResponseHelper.error(res, 'Invalid content_type', 400);
      }

      const contentData = {
        title,
        content_type,
        category,
        content_text,
        content_url,
        language: language || 'arabic',
        target_audience: target_audience || 'general',
        is_published: is_published || false,
        created_by: req.user?.user_id || 1 // Default to admin if no auth
      };

      const contentId = await HealthContentModel.create(contentData);
      const content = await HealthContentModel.getById(contentId);

      return ResponseHelper.success(res, content, 'Health content created successfully', 201);
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

 
  static async getContentById(req, res) {
    try {
      const { content_id } = req.params;

      const content = await HealthContentModel.getById(content_id);
      if (!content) {
        return ResponseHelper.notFound(res, 'Health content not found');
      }

   
      if (content.is_published) {
        await HealthContentModel.incrementViews(content_id);
      }

      return ResponseHelper.success(res, content, 'Health content retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  
  static async getAllContent(req, res) {
    try {
      const filters = {
        content_type: req.query.content_type,
        category: req.query.category,
        language: req.query.language,
        is_published: req.query.is_published !== undefined ? req.query.is_published === 'true' : undefined,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
      };

      const content = await HealthContentModel.getAll(filters);
      return ResponseHelper.success(res, content, 'Health content retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }


  static async updateContent(req, res) {
    try {
      const { content_id } = req.params;

      const content = await HealthContentModel.getById(content_id);
      if (!content) {
        return ResponseHelper.notFound(res, 'Health content not found');
      }

      const updated = await HealthContentModel.update(content_id, req.body);
      if (!updated) {
        return ResponseHelper.error(res, 'No valid fields to update', 400);
      }

      const updatedContent = await HealthContentModel.getById(content_id);
      return ResponseHelper.success(res, updatedContent, 'Health content updated successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

 
  static async deleteContent(req, res) {
    try {
      const { content_id } = req.params;

      const content = await HealthContentModel.getById(content_id);
      if (!content) {
        return ResponseHelper.notFound(res, 'Health content not found');
      }

      const deleted = await HealthContentModel.delete(content_id);
      if (!deleted) {
        return ResponseHelper.error(res, 'Failed to delete health content', 500);
      }

      return ResponseHelper.success(res, null, 'Health content deleted successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}

module.exports = HealthContentController;

