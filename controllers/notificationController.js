const Notification = require('../models/Notification');
const User = require('../models/User');

const getNotifications = async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUID: req.user.uid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const notifications = await Notification.find({ userId: currentUser._id })
      .populate('relatedUser', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error marking notification as read' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
