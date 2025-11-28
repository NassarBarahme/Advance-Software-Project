const {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserStatus,
  verifyUser
} = require("../models/users_DB");


async function getMyProfile(req, res) {
  try {
    const userId = req.user.user_id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ 
        error: "Profile not found" 
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      profile
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve profile",
      details: error.message 
    });
  }
}


async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    
    res.json({
      message: "Users retrieved successfully",
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve users",
      details: error.message 
    });
  }
}



async function getUserByIdController(req, res) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10); 
    const requesterId = req.user.user_id;
    const requesterRole = req.user.role;


    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: "Invalid user ID" 
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    
    delete user.password_hash;
    delete user.refresh_token;
    

 if (requesterRole !== "admin" && requesterId !== userId) {
  delete user.email;
  delete user.phone_number;
  delete user.date_of_birth;
}



    res.json({
      message: "User retrieved successfully",
      user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve user",
      details: error.message 
    });
  }
}


async function getUserProfileController(req, res) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10); 
    const requesterId = req.user.user_id;
    const requesterRole = req.user.role;

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: "Invalid user ID" 
      });
    }

    if (requesterRole !== "admin" && requesterId !== userId) {
      return res.status(403).json({ 
        error: "Access denied. You can only view your own detailed profile." 
      });
    }

    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ 
        error: "Profile not found" 
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      profile
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve profile",
      details: error.message 
    });
  }
}


async function updateUserController(req, res) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10); 
    const requesterId = req.user.user_id;
    const requesterRole = req.user.role;

    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: "Invalid user ID" 
      });
    }

    if (requesterRole !== "admin" && requesterId !== userId) {
      return res.status(403).json({ 
        error: "Access denied. You can only update your own profile." 
      });
    }

    const updateData = { ...req.body };

    if (requesterRole !== "admin") {
      delete updateData.role;
      delete updateData.is_active;
      delete updateData.is_verified;
      delete updateData.email; 
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: "No data provided for update" 
      });
    }

    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    
    delete updatedUser.password_hash;
    delete updatedUser.refresh_token;

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ 
      error: "Failed to update user",
      details: error.message 
    });
  }
}



async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10); 
    const { is_active } = req.body;

    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: "Invalid user ID" 
      });
    }

 
    if (is_active === undefined || is_active === null) {
      return res.status(400).json({ 
        error: "is_active field is required" 
      });
    }

  
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ 
        error: "is_active must be true or false" 
      });
    }

    
    if (userId === req.user.user_id) {
      return res.status(400).json({ 
        error: "You cannot deactivate your own account" 
      });
    }

    const updated = await updateUserStatus(userId, is_active);

    if (!updated) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    res.json({
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      user_id: userId,
      is_active
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ 
      error: "Failed to update user status",
      details: error.message 
    });
  }
}


async function verifyUserController(req, res) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10); 

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: "Invalid user ID" 
      });
    }

    const verified = await verifyUser(userId);

    if (!verified) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    res.json({
      message: "User verified successfully",
      user_id: userId
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({ 
      error: "Failed to verify user",
      details: error.message 
    });
  }
}


async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10); 

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: "Invalid user ID" 
      });
    }

    if (userId === req.user.user_id) {
      return res.status(400).json({ 
        error: "You cannot delete your own account" 
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(500).json({ 
        error: "Failed to delete user" 
      });
    }

    res.json({
      message: "User deleted successfully",
      deleted_user: {
        user_id: userId,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ 
      error: "Failed to delete user",
      details: error.message 
    });
  }
}

module.exports = {
  getMyProfile,
  getUsers,
  getUserByIdController,
  getUserProfileController,
  updateUserController,
  toggleUserStatus,
  verifyUserController,
  deleteUserController
};