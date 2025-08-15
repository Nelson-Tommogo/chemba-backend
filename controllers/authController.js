import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role, location, contact } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role, location, contact });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { 
      user: { 
        id: user.id, 
        role: user.role 
      } 
    };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '5d' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { 
      user: { 
        id: user.id, 
        role: user.role 
      } 
    };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '5d' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const logout = async (req, res) => {
  try {
    // In a real application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Clear cookies if using them
    // 3. Perform other cleanup
    
    res.status(200).json({ msg: 'Logout successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Implement your token refresh logic here
    // Typically this would verify the refresh token and issue a new access token
    
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ msg: 'Refresh token is required' });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: 'Invalid refresh token' });
      }

      // Create new access token
      const payload = { 
        user: { 
          id: decoded.user.id, 
          role: decoded.user.role 
        } 
      };
      
      jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }, 
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};