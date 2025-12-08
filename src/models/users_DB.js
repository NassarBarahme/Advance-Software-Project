const bcrypt = require("bcryptjs");
const pool = require("../config/database");

// Fetch user by ID, excluding sensitive fields like password
async function getUserById(user_id) {
  try {
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = ?`,
      [user_id]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    
 
    delete user.password_hash;
    
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}


async function getAllUsers() {
  try {
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       ORDER BY u.created_at DESC`
    );

   
    users.forEach((user) => {
      delete user.password_hash;
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}


async function emailCheck(email) {
  try {
    const [rows] = await pool.query(
      "SELECT 1 FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
}


async function updateUser(user_id, updateData) {
  const connection = await pool.getConnection();
  
  try {
    
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id]
    );

    if (existingUser.length === 0) {
      return null;
    }


    const allowedFields = [
      'full_name',
      'email',
      'phone_number',
      'date_of_birth',
      'gender',
      'preferred_language',
      'profile_data',
      'is_active'
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

   
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return existingUser[0];
    }

    values.push(user_id);

    await connection.beginTransaction();

  
    await connection.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    // Update doctor specialization if provided
    if (updateData.specialization !== undefined) {
      const [doctorCheck] = await connection.query(
        "SELECT 1 FROM doctors WHERE doctor_id = ?",
        [user_id]
      );
      
      if (doctorCheck.length > 0) {
        await connection.query(
          "UPDATE doctors SET specialization = ? WHERE doctor_id = ?",
          [updateData.specialization, user_id]
        );
      }
    }

    await connection.commit();

    const updatedUser = await getUserById(user_id);
    return updatedUser;

  } catch (error) {
    await connection.rollback();
    console.error("Error updating user:", error);
    throw error;
  } finally {
    connection.release();
  }
}


async function deleteUser(user_id) {
  try {
    const [result] = await pool.query(
      "DELETE FROM users WHERE user_id = ?",
      [user_id]
    );

    if (result.affectedRows === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}


async function getUserProfile(user_id) {
  try {
   
    const user = await getUserById(user_id);
    
    if (!user) {
      return null;
    }

    
    if (user.role_name === 'patient') {
      const [patients] = await pool.query(
        `SELECT * FROM patients WHERE patient_id = ?`,
        [user_id]
      );
      
      if (patients.length > 0) {
        user.patient_data = patients[0];
      }
    } else if (user.role_name === 'doctor') {
      const [doctors] = await pool.query(
        `SELECT * FROM doctors WHERE doctor_id = ?`,
        [user_id]
      );
      
      if (doctors.length > 0) {
        user.doctor_data = doctors[0];
        
      
        const [certifications] = await pool.query(
          `SELECT * FROM doctor_certifications WHERE doctor_id = ?`,
          [user_id]
        );
        user.doctor_data.certifications = certifications;
      }
    } else if (user.role_name === 'ngo') {
      const [ngos] = await pool.query(
        `SELECT * FROM ngos WHERE ngo_id = ?`,
        [user_id]
      );
      
      if (ngos.length > 0) {
        user.ngo_data = ngos[0];
      }
    }

    return user;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}


async function updateUserStatus(user_id, is_active) {
  try {
    const [result] = await pool.query(
      "UPDATE users SET is_active = ? WHERE user_id = ?",
      [is_active, user_id]
    );

    if (result.affectedRows === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
}


async function verifyUser(user_id) {
  try {
    const [result] = await pool.query(
      "UPDATE users SET is_verified = TRUE WHERE user_id = ?",
      [user_id]
    );

    if (result.affectedRows === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying user:", error);
    throw error;
  }
}


module.exports = {
  getUserById,
  getAllUsers,
  emailCheck,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserStatus,
  verifyUser
};