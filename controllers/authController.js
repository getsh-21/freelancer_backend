const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, bio } = req.body;

    // Block admin registration from the public form
    if (role === 'admin') {
      return res.status(403).json({ message: 'You cannot register as admin. Contact the super admin.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, skills, bio });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      skills: user.skills, bio: user.bio, profileImage: user.profileImage,
      rating: user.rating, token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        skills: user.skills, bio: user.bio, profileImage: user.profileImage,
        rating: user.rating, token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile };