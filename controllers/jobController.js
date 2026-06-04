const Job = require('../models/Job');
const Notification = require('../models/Notification');

const createJob = async (req, res) => {
  try {
    const { title, description, budget, skillsRequired, deadline } = req.body;
    const attachments = req.files ? req.files.map(f => f.filename) : [];
    const job = await Job.create({
      title, description, budget,
      skillsRequired: skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : [],
      deadline, client: req.user._id, attachments,
    });
    const populated = await job.populate('client', 'name email');
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getJobs = async (req, res) => {
  try {
    const { search, status, minBudget, maxBudget } = req.query;
    let query = {};
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    const jobs = await Job.find(query).populate('client', 'name email profileImage').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email profileImage rating')
      .populate('acceptedFreelancer', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('client', 'name email');
    res.json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id }).populate('acceptedFreelancer', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs };