import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize conversation cache (stores conversations for 1 hour)
const conversationCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => {
    res.send('Learner Assist Backend (Groq) is Running 🚀');
});

// Enhanced system prompts for better explanations
const getSystemPrompt = (feature) => {
    const prompts = {
        explainer: `You are an expert educator who explains concepts in a clear, engaging, and beginner-friendly way. 
Use analogies, examples, and structured explanations. Break down complex topics into digestible parts. 
Format your responses with proper markdown including headings, bullet points, and code blocks when relevant.`,
        code: `You are an expert code reviewer and educator. Explain code clearly, covering:
1. What the code does (high-level overview)
2. How it works (line-by-line or block-by-block)
3. Key concepts used
4. Potential improvements or best practices
Use markdown formatting with code blocks and syntax highlighting.`,
        roadmap: `You are a learning path architect. Create comprehensive, step-by-step learning roadmaps with:
- Clear progression from beginner to advanced
- Key topics and subtopics
- Recommended resources
- Estimated time for each phase
- Practical projects to build
Format with markdown headings and lists.`,
        summary: `You are a note-taking expert. Create concise, well-organized summaries with:
- Key points in bullet format
- Important concepts highlighted
- Logical grouping of related information
Use markdown formatting for clarity.`,
        ideas: `You are a creative project advisor. Suggest unique, practical project ideas that:
- Match the user's skill level
- Demonstrate real-world applications
- Build portfolio value
- Include brief implementation hints
Format with markdown headings and lists.`
    };
    return prompts[feature] || prompts.explainer;
};

const generatePrompt = (feature, input) => {
    switch (feature) {
        case 'explainer':
            return `Explain the concept of "${input}" in a clear and engaging way. Use analogies and examples where helpful.`;
        case 'code':
            return `Explain the following code snippet in detail:\n\n${input}`;
        case 'roadmap':
            return `Create a comprehensive step-by-step learning roadmap for "${input}". Include key topics, resources, and milestones.`;
        case 'summary':
            return `Summarize the following notes into well-organized, concise bullet points:\n\n${input}`;
        case 'ideas':
            return `Suggest 3 unique and practical project ideas related to "${input}" that would be great for a portfolio. Include brief implementation hints.`;
        default:
            return input;
    }
};

// Main API endpoint with conversation context support
app.post('/api/generate', async (req, res) => {
    const { feature, input, conversationId, conversationHistory = [] } = req.body;

    if (!input) {
        return res.status(400).json({ error: 'Input is required' });
    }

    try {
        // Build conversation messages with context
        const messages = [
            {
                role: "system",
                content: getSystemPrompt(feature)
            }
        ];

        // Add conversation history for context (last 10 messages)
        const recentHistory = conversationHistory.slice(-10);
        messages.push(...recentHistory);

        // Add current user message
        messages.push({
            role: "user",
            content: generatePrompt(feature, input)
        });

        console.log(`Generating content for feature: ${feature} using Groq (with ${recentHistory.length} context messages)`);

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.7,
            max_tokens: 2048,
        });

        const text = chatCompletion.choices[0]?.message?.content || "No response generated.";

        // Store conversation if conversationId provided
        if (conversationId) {
            const updatedHistory = [
                ...recentHistory,
                { role: "user", content: input },
                { role: "assistant", content: text }
            ];
            conversationCache.set(conversationId, updatedHistory);
        }

        res.json({
            result: text,
            conversationId: conversationId || null
        });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Streaming endpoint for real-time responses
app.post('/api/generate/stream', async (req, res) => {
    const { feature, input, conversationId, conversationHistory = [] } = req.body;

    if (!input) {
        return res.status(400).json({ error: 'Input is required' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Build conversation messages with context
        const messages = [
            {
                role: "system",
                content: getSystemPrompt(feature)
            }
        ];

        // Add conversation history for context (last 10 messages)
        const recentHistory = conversationHistory.slice(-10);
        messages.push(...recentHistory);

        // Add current user message
        messages.push({
            role: "user",
            content: generatePrompt(feature, input)
        });

        console.log(`Streaming content for feature: ${feature} using Groq (with ${recentHistory.length} context messages)`);

        const stream = await groq.chat.completions.create({
            messages: messages,
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.7,
            max_tokens: 2048,
            stream: true, // Enable streaming
        });

        let fullText = '';

        // Stream the response chunks
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullText += content;
                // Send chunk to client
                res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
            }
        }

        // Store conversation if conversationId provided
        if (conversationId) {
            const updatedHistory = [
                ...recentHistory,
                { role: "user", content: input },
                { role: "assistant", content: fullText }
            ];
            conversationCache.set(conversationId, updatedHistory);
        }

        // Send completion signal
        res.write(`data: ${JSON.stringify({ content: '', done: true, fullText })}\n\n`);
        res.end();

    } catch (error) {
        console.error('AI Streaming Error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate content' })}\n\n`);
        res.end();
    }
});

// Get conversation history
app.get('/api/conversation/:id', (req, res) => {
    const { id } = req.params;
    const history = conversationCache.get(id);

    if (history) {
        res.json({ history });
    } else {
        res.status(404).json({ error: 'Conversation not found' });
    }
});

// Clear conversation
app.delete('/api/conversation/:id', (req, res) => {
    const { id } = req.params;
    conversationCache.del(id);
    res.json({ message: 'Conversation cleared' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

