import User from '../models/User.js';

// Get users by role
export const getUsersByRole = async (req, res) => {
  const { role } = req.params;
  
  if (!role) {
    return res.status(400).json({ error: 'Role parameter is required' });
  }

  try {
    const users = await User.find({ role })
      .select('-password -__v')
      .lean();
    
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
      .select('-password -__v -refreshToken')
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

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'avatar'];
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -__v -refreshToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error updating user profile:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Deactivate user account
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        isActive: false,
        deactivatedAt: new Date() 
      },
      { new: true }
    ).select('-password -__v -refreshToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Account deactivated successfully',
      deactivatedAt: user.deactivatedAt 
    });
  } catch (err) {
    console.error('Error deactivating user:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};