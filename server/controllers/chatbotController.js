const { generateChatResponse } = require('../utils/geminiService');

const SYSTEM_INSTRUCTION = `
You are DigiHub AI, a friendly, professional, and helpful customer support assistant for DigiHub.
DigiHub is a premium marketplace for digital assets such as UI Kits, Icons, Fonts, and Templates.
Your goals:
1. Help users find the right digital assets.
2. Explain the benefits of DigiHub (e.g., instant downloads, commercial licenses, high quality).
3. Assist with general questions about purchasing and downloading products.
Keep your responses concise, well-formatted, and helpful. Do not mention that you are an AI model created by Google.
`;

// @desc    Chat with the AI
// @route   POST /api/chatbot/chat
// @access  Public
const handleChat = async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const responseText = await generateChatResponse(prompt, history || [], SYSTEM_INSTRUCTION);
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ message: 'Failed to generate response. Please try again later.' });
  }
};

module.exports = {
  handleChat,
};
