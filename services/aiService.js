const { Groq } = require('groq-sdk');

let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log('Groq SDK initialized.');
} else {
  console.warn('GROQ_API_KEY not set. AI features will be disabled or mocked.');
}

const enhanceBio = async (bioText) => {
  if (!groq) return bioText; // fallback if no key
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert LinkedIn profile optimizer. Rewrite the user's bio to sound professional, engaging, and suitable for a LinkedIn profile. Return ONLY the enhanced bio text without any introductions, quotes, or conversational padding."
        },
        {
          role: "user",
          content: `Rewrite this bio to sound professional for a LinkedIn profile:\n\n${bioText}`
        }
      ],
      model: "llama3-8b-8192", // Using Llama 3 on Groq
      temperature: 0.7,
    });
    return chatCompletion.choices[0]?.message?.content || bioText;
  } catch (error) {
    console.error('Groq enhanceBio Error:', error);
    return bioText; // fallback
  }
};

const enhanceCaption = async (captionText) => {
  if (!groq) return captionText;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert LinkedIn content strategist. Improve the user's post caption to sound more professional and engaging. Return ONLY the improved caption text, no conversational padding."
        },
        {
          role: "user",
          content: `Improve this LinkedIn post caption to sound more professional and engaging:\n\n${captionText}`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
    });
    return chatCompletion.choices[0]?.message?.content || captionText;
  } catch (error) {
    console.error('Groq enhanceCaption Error:', error);
    return captionText;
  }
};

module.exports = {
  enhanceBio,
  enhanceCaption
};
