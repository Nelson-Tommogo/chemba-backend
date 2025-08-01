import User from '../models/User.js';  // Import the User model directly

export async function getUsersByRole(req, res) {
  try {
    const { role } = req.params;
    // Call find() on the User model
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    // Call findById() on the User model
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
}