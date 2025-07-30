import { find, findById } from '../models/User.js';

export async function getUsersByRole(req, res) {
  try {
    const { role } = req.params;
    const users = await find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}