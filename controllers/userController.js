import User from '../models/User.js';

// Get users by role
export const getUsersByRole = async (req, res) => {
  const { role } = req.params;
  
  // Validate role parameter
  if (!role) {
    return res.status(400).json({ error: 'Role parameter is required' });
  }

  try {
    const users = await User.find({ role })
      .select('-password -__v') // Exclude sensitive/uneeded fields
      .lean(); // Convert to plain JS objects
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found with this role' });
    }

    res.json(users);
  } catch (err) {
    console.error('Error fetching users by role:', err.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -refreshToken') // Enhanced security
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching current user:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};