const { Mistral } = require('@mistralai/mistralai');

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

const SYSTEM_PROMPT = `You are a professional fitness and nutrition coach AI assistant. 
Your role is to provide helpful, accurate, and safe advice ONLY on topics related to:
- Fitness and exercise
- Nutrition and diet
- Workout plans
- Meal planning
- Weight management
- Sports performance
- Recovery and rest
- Injury prevention

IMPORTANT RULES:
1. ONLY answer questions about fitness and nutrition
2. If asked about anything else, politely redirect to fitness/nutrition topics
3. Always prioritize user safety - recommend consulting healthcare professionals for medical issues
4. Provide evidence-based advice
5. Be encouraging and supportive
6. Keep responses concise but informative (2-4 sentences usually)
7. Never provide medical diagnoses or treatment plans

If a user asks about topics outside fitness/nutrition, respond with:
"I'm specialized in fitness and nutrition advice only. I'd be happy to help you with workout plans, nutrition tips, or fitness-related questions! What would you like to know?"`;

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });
    }

    messages.push({
      role: 'user',
      content: message.trim()
    });

    const chatResponse = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: messages,
      maxTokens: 500,
      temperature: 0.7
    });

    const aiResponse = chatResponse.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('AI Coach Error:', error);
    
    if (error.message?.includes('API key') || error.message?.includes('401')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please contact support.',
        error: 'Invalid API configuration'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to get AI response. Please try again.',
      error: error.message 
    });
  }
};