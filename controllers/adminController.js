const User = require('../models/User');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const Review = require('../models/Review');

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'superadmin' } });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
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

    res.json({
      totalUsers, totalClients, totalFreelancers, totalAdmins,
      totalJobs, openJobs, completedJobs, inProgressJobs,
      totalProposals, totalReviews, last7Days,
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete superadmin.' });
    }
    // Admins cannot delete other admins — only superadmin can
    if (user.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can delete admins.' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminDeleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Superadmin only: promote a user to admin
const promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') return res.status(400).json({ message: 'Cannot modify superadmin.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'User is already an admin.' });
    user.role = 'admin';
    await user.save();
    res.json({ message: `${user.name} has been promoted to admin.`, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Superadmin only: revoke admin and revert to freelancer
const revokeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') return res.status(400).json({ message: 'Cannot modify superadmin.' });
    if (user.role !== 'admin') return res.status(400).json({ message: 'User is not an admin.' });
    user.role = 'freelancer';
    await user.save();
    res.json({ message: `${user.name}'s admin access has been revoked.`, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAnalytics, deleteUser, adminDeleteJob, promoteToAdmin, revokeAdmin };