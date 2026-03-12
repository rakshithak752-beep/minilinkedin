const { enhanceBio, enhanceCaption } = require('../services/aiService');

const enhanceUserBio = async (req, res) => {
  try {
    const { bioText } = req.body;
    if (!bioText) return res.status(400).json({ error: 'Bio text is required' });

    const enhancedText = await enhanceBio(bioText);
    res.status(200).json({ enhancedText });
  } catch (error) {
    res.status(500).json({ error: 'Server error enhancing bio' });
  }
};

const enhancePostCaption = async (req, res) => {
  try {
    const { captionText } = req.body;
    if (!captionText) return res.status(400).json({ error: 'Caption text is required' });

    const enhancedText = await enhanceCaption(captionText);
    res.status(200).json({ enhancedText });
  } catch (error) {
    res.status(500).json({ error: 'Server error enhancing caption' });
  }
};

module.exports = {
  enhanceUserBio,
  enhancePostCaption
};
