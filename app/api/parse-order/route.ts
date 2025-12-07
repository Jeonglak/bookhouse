import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Try multiple models in order of preference/stability
        const modelsToTry = ['gemini-1.5-flash-002', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
        let textResponse = '';
        let lastError;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting to use model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `
              You are a book order parser. Convert the user's input text into a JSON Array of book orders.
              
              Rules:
              1. Extract 'title' and 'quantity' (number).
              2. Default quantity is 1 if not specified.
              3. Correct typos (e.g., '공수' -> '공통수학', '쏀' -> '쎈').
              4. Ignore greetings or irrelevant text.
              5. Output ONLY the JSON Array. No markdown, no explanations.
        
              Examples:
              Input: "쎈 수1 3권, 마플 시너지 수2"
              Output: [{"title": "쎈 수1", "quantity": 3}, {"title": "마플 시너지 수2", "quantity": 1}]
        
              Input: "개념원리 대수"
              Output: [{"title": "개념원리 대수", "quantity": 1}]
        
              Input: ${text}
            `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                textResponse = response.text();

                if (textResponse) break; // Success!
            } catch (error) {
                console.warn(`Failed with model ${modelName}:`, error);
                lastError = error;
                // Continue to next model
            }
        }

        if (!textResponse) {
            throw lastError || new Error('All models failed');
        }

        console.log('Gemini Raw Response:', textResponse); // Debug log

        // Clean up markdown code blocks if present
        let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        // Attempt to find JSON array if mixed with text
        const jsonArrayMatch = cleanJson.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch) {
            cleanJson = jsonArrayMatch[0];
        }

        try {
            const parsedData = JSON.parse(cleanJson);
            return NextResponse.json({ items: parsedData });
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.error('Failed JSON content:', cleanJson);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: textResponse }, { status: 500 });
        }
    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: 'AI service error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
