const { createNGO, getAllNGOs, getNGOById, updateNGO, deleteNGO, searchNGOs } = require('../models/ngo');
const ResponseHelper = require('../utils/responseHelper');

// Create a new NGO
async function createNGOController(req, res) {
  try {
    const { ngo_id, organization_name, license_number, contact_person, verified, meta, created_by } = req.body;

    
    if (!ngo_id || !organization_name) {
      const errors = [];
      if (!ngo_id) errors.push({ field: 'ngo_id', message: 'NGO ID is required' });
      if (!organization_name) errors.push({ field: 'organization_name', message: 'Organization name is required' });
      return ResponseHelper.validationError(res, errors);
    }

    const result = await createNGO({
      ngo_id,
      organization_name,
      license_number,
      contact_person,
      verified: verified || false,
      meta,
      created_by
    });

    return ResponseHelper.success(res, { ngo_id }, 'NGO created successfully', 201);
  } catch (error) {
    console.error('Error creating NGO:', error);
    return ResponseHelper.error(res, 'Failed to create NGO', 500, error.message);
  }
}




// Get all NGOs
async function getAllNGOsController(req, res) {
  try {
    const ngos = await getAllNGOs(req.db);
    return ResponseHelper.success(res, ngos, 'NGOs retrieved successfully');
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    return ResponseHelper.error(res, 'Failed to fetch NGOs', 500, error.message);
  }
}

// Get NGO by ID
async function getNGOByIdController(req, res) {
  try {
    const { id } = req.params;
    if (!id) return ResponseHelper.validationError(res, [{ field: 'id', message: 'NGO ID is required' }]);

    const ngo = await getNGOById(id); // ← هنا فقط id بدون أي pool
    if (!ngo) return ResponseHelper.notFound(res, 'NGO not found');

    return ResponseHelper.success(res, ngo, 'NGO retrieved successfully');
  } catch (error) {
    console.error('Error fetching NGO:', error);
    return ResponseHelper.error(res, 'Failed to fetch NGO', 500, error.message);
  }
}

// Update NGO
async function updateNGOController(req, res) {
    try {
        const { id } = req.params;
        const { organization_name, license_number, contact_person, verified, meta } = req.body;

        if (!id) {
            return ResponseHelper.validationError(res, [{ field: 'id', message: 'NGO ID is required' }]);
        }

        
        const existingNGO = await getNGOById(id);
        if (!existingNGO) {
            return ResponseHelper.notFound(res, 'NGO not found');
        }

       
        const result = await updateNGO(id, { organization_name, license_number, contact_person, verified, meta });
        const updatedNGO = await getNGOById(id);

        return ResponseHelper.success(res, updatedNGO, 'NGO updated successfully');

    } catch (error) {
        console.error('Error updating NGO:', error);
        return ResponseHelper.error(res, 'Failed to update NGO', 500, error.message);
    }
}
// Delete NGO
async function deleteNGOController(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) return ResponseHelper.validationError(res, [{ field: 'id', message: 'NGO ID is required' }]);

    const existingNGO = await getNGOById(id);
    
    if (!existingNGO) return ResponseHelper.notFound(res, 'NGO not found');

    const result = await deleteNGO(id);

    return ResponseHelper.success(res, { deleted: true }, 'NGO deleted successfully');
  } catch (error) {
    
    return ResponseHelper.error(res, 'Failed to delete NGO', 500, error.message);
  }
}


// Search NGOs
async function searchNGOsController(req, res) {
  try {
    const { query, verified, limit = 10, offset = 0 } = req.query ?? {};
    const rows = await searchNGOs(req.db, {
      query,
      verified: verified !== undefined ? verified === 'true' : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return ResponseHelper.success(res, rows, 'Search completed successfully');
  } catch (error) {
    console.error('Error searching NGOs:', error);
    return ResponseHelper.error(res, 'Failed to search NGOs', 500, error.message);
  }
}

module.exports = {
  createNGOController,
  getAllNGOsController,
  getNGOByIdController,
  updateNGOController,
  deleteNGOController,
  searchNGOsController
};
