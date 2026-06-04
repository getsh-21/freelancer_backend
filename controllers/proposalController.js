const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const submitProposal = async (req, res) => {
  try {
    const { jobId, proposalText, bidAmount, deliveryTime } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open' });
    const existing = await Proposal.findOne({ job: jobId, freelancer: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already submitted a proposal' });
    const proposal = await Proposal.create({ job: jobId, freelancer: req.user._id, proposalText, bidAmount, deliveryTime });
    await Notification.create({ user: job.client, message: `New proposal received for "${job.title}"`, type: 'proposal', link: `/client/jobs/${jobId}/proposals` });
    const populated = await proposal.populate('freelancer', 'name email profileImage rating skills');
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getJobProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ job: req.params.jobId })
      .populate('freelancer', 'name email profileImage rating reviewsCount skills bio').sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    const job = await Job.findById(proposal.job);
    if (job.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    proposal.status = req.body.status;
    await proposal.save();
    if (req.body.status === 'accepted') {
      await Job.findByIdAndUpdate(job._id, { status: 'in-progress', acceptedFreelancer: proposal.freelancer });
      await Proposal.updateMany({ job: job._id, _id: { $ne: proposal._id } }, { status: 'rejected' });
      await Notification.create({ user: proposal.freelancer, message: `Your proposal for "${job.title}" was accepted!`, type: 'job' });
    } else if (req.body.status === 'rejected') {
      await Notification.create({ user: proposal.freelancer, message: `Your proposal for "${job.title}" was rejected.`, type: 'job' });
    }
    res.json(proposal);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('job', 'title budget status client deadline').sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { submitProposal, getJobProposals, updateProposal, getMyProposals };