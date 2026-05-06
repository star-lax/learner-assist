import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

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

// Configure body parser for larger payloads (base64 images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
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
Format your responses with proper markdown including headings, bullet points, and code blocks when relevant.
If the user provides an image or PDF content, use it as primary context for your explanation.`,
        code: `You are an expert code reviewer and educator. Explain code clearly, covering:
1. What the code does (high-level overview)
2. How it works (line-by-line or block-by-block)
3. Key concepts used
4. Potential improvements or best practices
Use markdown formatting with code blocks and syntax highlighting.
If an image of code is provided, analyze the code in the image carefully.`,
        roadmap: `You are a learning path architect. Your task is to generate a TRACKABLE day-by-day or step-by-step learning roadmap.
CRITICAL FORMATTING RULE: 
- Every major section MUST be a heading (###) starting with "Day X:", "Step X:", or "Phase X:".
- You MUST provide at least 5 such milestones.
- Under each heading, provide exactly 3-5 checkable tasks via bullet points (-).
Do not provide a general introduction. Start immediately with the roadmap milestones.`,
        summary: `You are a note-taking expert. Create concise, well-organized summaries with:
- Key points in bullet format
- Important concepts highlighted
- Logical grouping of related information
Use markdown formatting for clarity.
If a PDF is provided, summarize its core message and key takeaways.`,
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

// Helper: Extract text from base64 PDF
const extractPdfText = async (base64String) => {
    try {
        const buffer = Buffer.from(base64String.split(',')[1], 'base64');
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF Parsing Error:', error);
        return '[Error extracting text from PDF]';
    }
};

// FIXED: Smart model selection based on whether images are present
const selectModel = (hasImages) => {
    if (hasImages) {
        // Use vision-capable model for images
        return "meta-llama/llama-4-scout-17b-16e-instruct";
    } else {
        // Use text-only model for better performance
        return "llama-3.3-70b-versatile";
    }
};
// Streaming endpoint for real-time responses
app.post('/api/generate/stream', async (req, res) => {
    const { feature, input, conversationId, conversationHistory = [], attachments = [] } = req.body;

    if (!input && attachments.length === 0) {
        return res.status(400).json({ error: 'Input or attachments are required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        let finalInput = input;
        let images = [];

        // Process attachments
        // Process attachments
        for (const file of attachments) {
            if (file.type.startsWith('image/')) {
                images.push(file.url); // base64 url
                console.log(`[IMAGE] Added image: ${file.name}`);
            } else if (file.type === 'application/pdf') {
                const pdfText = await extractPdfText(file.url);
                finalInput += `\n\n[Content from attached PDF "${file.name}"]:\n${pdfText}`;
                console.log(`[PDF] Extracted ${pdfText.length} characters from ${file.name}`);
            }
        }
        const systemPrompt = getSystemPrompt(feature);
        const userPrompt = generatePrompt(feature, finalInput);

        let messages = [];
        const recentHistory = conversationHistory.slice(-10);

        if (images.length > 0) {
            console.log(`[VISION MODE] Processing ${images.length} image(s)`);
            // Include system prompt instructions inside the user content for multimodal
            const contentParts = [
                { type: "text", text: `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}` }
            ];
            images.forEach((img, idx) => {
                console.log(`[IMAGE ${idx + 1}] Adding to content parts`);
                contentParts.push({
                    type: "image_url",
                    image_url: { url: img }
                });
            });
            messages = [...recentHistory, { role: "user", content: contentParts }];
        } else {
            console.log(`[TEXT MODE] No images detected`);
            messages = [
                { role: "system", content: systemPrompt },
                ...recentHistory,
                { role: "user", content: userPrompt }
            ];
        }

        const model = selectModel(images.length > 0);
        console.log(`[MODEL] Selected: ${model} | Images: ${images.length} | Has Vision: ${images.length > 0}`);

        const stream = await groq.chat.completions.create({
            messages: messages,
            model: model,
            temperature: 0.7,
            max_tokens: 2048,
            stream: true,
        }).catch(err => {
            console.error(`[GROQ ERROR] ${err.message}`);
            console.error(`[GROQ ERROR] Full error:`, err);
            throw err;
        });

        let fullText = '';
        let chunkCount = 0;
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullText += content;
                chunkCount++;
                res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
            }
        }
        console.log(`[DEBUG] Sent ${chunkCount} chunks. Total chars: ${fullText.length}`);

        if (conversationId) {
            const updatedHistory = [
                ...recentHistory,
                { role: "user", content: input || "[Attachment sent]" },
                { role: "assistant", content: fullText }
            ];
            conversationCache.set(conversationId, updatedHistory);
        }

        res.write(`data: ${JSON.stringify({ content: '', done: true, fullText })}\n\n`);
        res.end();

    } catch (error) {
        console.error('AI Streaming Error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate content' })}\n\n`);
        res.end();
    }
});

app.get('/api/conversation/:id', (req, res) => {
    const { id } = req.params;
    const history = conversationCache.get(id);
    if (history) res.json({ history });
    else res.status(404).json({ error: 'Conversation not found' });
});

app.delete('/api/conversation/:id', (req, res) => {
    const { id } = req.params;
    conversationCache.del(id);
    res.json({ message: 'Conversation cleared' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Vision Model: meta-llama/llama-4-scout-17b-16e-instruct`);
    console.log(`Text Model: llama-3.3-70b-versatile`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Use 'netstat -ano | findstr :${PORT}' then 'taskkill /PID <pid> /F', or set PORT env var to a free port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

