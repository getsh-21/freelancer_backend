const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createReview = async (req, res) => {
  try {
    const { freelancerId, jobId, rating, comment } = req.body;
    const existing = await Review.findOne({ client: req.user._id, job: jobId });
    if (existing) return res.status(400).json({ message: 'Already reviewed this job' });
    const review = await Review.create({ client: req.user._id, freelancer: freelancerId, job: jobId, rating, comment });
    const reviews = await Review.find({ freelancer: freelancerId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(freelancerId, { rating: Math.round(avg * 10) / 10, reviewsCount: reviews.length });
    await Notification.create({ user: freelancerId, message: `You received a ${rating}-star review!`, type: 'review' });
    res.status(201).json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancer: req.params.freelancerId })
      .populate('client', 'name profileImage').populate('job', 'title').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createReview, getFreelancerReviews };