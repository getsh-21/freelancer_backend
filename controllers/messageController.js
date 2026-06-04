const Message = require('../models/Message');
const Notification = require('../models/Notification');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const attachments = req.files ? req.files.map(f => f.filename) : [];
    const message = await Message.create({ sender: req.user._id, receiver: receiverId, content, attachments });
    await Notification.create({ user: receiverId, message: `New message from ${req.user.name}`, type: 'message', link: '/messages' });
    const populated = await message.populate('sender', 'name profileImage');
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id, receiver: req.params.userId }, { sender: req.params.userId, receiver: req.user._id }],
    }).populate('sender', 'name profileImage').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getChatPartners = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).populate('sender', 'name profileImage').populate('receiver', 'name profileImage').sort({ createdAt: -1 });
    const partners = {};
    messages.forEach(msg => {
      const other = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      if (other && !partners[other._id]) partners[other._id] = { user: other, lastMessage: msg };
    });
    res.json(Object.values(partners));
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { sendMessage, getMessages, getChatPartners };