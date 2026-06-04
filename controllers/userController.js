const User = require('../models/User');
const upload = require('../middleware/uploadMiddleware');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;
    const updateData = { name, bio, skills: skills ? skills.split(',').map(s => s.trim()) : [] };
    if (req.file) updateData.profileImage = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllUsers, getUserById, updateProfile };