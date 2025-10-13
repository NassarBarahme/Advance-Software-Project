function validateUserData(userData) {
  const { full_name, email, password, role_id } = userData;

  if (!full_name || typeof full_name !== 'string') {
    return 'Full name is required and must be a string.';
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'A valid email is required.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password is required and must be at least 6 characters long.';
  }

  if (!role_id || typeof role_id !== 'number') {
    return 'Role ID is required and must be a number.';
  }

  return null; // No validation errors
}

module.exports = {
  validateUserData,
};