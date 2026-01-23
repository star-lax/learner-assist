import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log(`[DEBUG] API Key loaded: ${key ? "YES (" + key.substring(0, 8) + "......)" : "NO"}`);

const genAI = new GoogleGenerativeAI(key);

async function testModel() {
    try {
        // Try gemini-1.5-flash which is standard
        const modelName = "gemini-1.5-flash";
        console.log(`[DEBUG] Testing model: '${modelName}'...`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello friend");
        console.log("[SUCCESS] Response:", result.response.text());

    } catch (error) {
        console.error("[ERROR] Failed to generate content.");
        console.error("Message:", error.message);
    }
}

testModel();
