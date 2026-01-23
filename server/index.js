import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => {
    res.send('Learner Assist Backend (Groq) is Running 🚀');
});

const generatePrompt = (feature, input) => {
    switch (feature) {
        case 'explainer':
            return `Explain the concept of "${input}" in simple terms suitable for a beginner. Use analogies if possible.`;
        case 'code':
            return `Explain the following code snippet in detail:\n\n${input}`;
        case 'roadmap':
            return `Create a step-by-step learning roadmap for "${input}". Include key topics and resources.`;
        case 'summary':
            return `Summarize the following notes into concise bullet points:\n\n${input}`;
        case 'ideas':
            return `Suggest 3 unique project ideas related to "${input}" for a portfolio.`;
        default:
            return input;
    }
};

app.post('/api/generate', async (req, res) => {
    const { feature, input } = req.body;

    if (!input) {
        return res.status(400).json({ error: 'Input is required' });
    }

    try {
        const prompt = generatePrompt(feature, input);

        console.log(`Generating content for feature: ${feature} using Groq`);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
        });

        const text = chatCompletion.choices[0]?.message?.content || "No response generated.";

        res.json({ result: text });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
