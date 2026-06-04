const User = require('../models/User');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const Review = require('../models/Review');

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const inProgressJobs = await Job.countDocuments({ status: 'in-progress' });
    const totalProposals = await Proposal.countDocuments();
    const totalReviews = await Review.countDocuments();

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await Job.countDocuments({ createdAt: { $gte: start, $lte: end } });
      last7Days.push({ date: start.toISOString().split('T')[0], jobs: count });
    }

    res.json({ totalUsers, totalClients, totalFreelancers, totalJobs, openJobs, completedJobs, inProgressJobs, totalProposals, totalReviews, last7Days });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Protect super admin from being deleted
    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin cannot be deleted' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminDeleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Only super admin can promote a user to admin
const promoteToAdmin = async (req, res) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super admin can promote users to admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ message: 'This user is already the super admin' });

    user.role = 'admin';
    await user.save();
    res.json({ message: `${user.name} has been promoted to admin`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Only super admin can demote an admin back to freelancer
const demoteFromAdmin = async (req, res) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super admin can demote admins' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ message: 'Cannot demote the super admin' });
    if (user.role !== 'admin') return res.status(400).json({ message: 'User is not an admin' });

    user.role = 'freelancer';
    await user.save();
    res.json({ message: `${user.name} has been demoted to freelancer`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, deleteUser, adminDeleteJob, promoteToAdmin, demoteFromAdmin };