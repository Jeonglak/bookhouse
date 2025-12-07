import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (!apiKey) {
            console.error('API Key missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

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

        // Function to call Gemini REST API
        async function callGemini(modelName: string) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }

        // Try models in order: gemini-1.5-flash -> gemini-pro
        let textResponse = '';
        let lastError;

        try {
            console.log('Attempting gemini-1.5-flash via REST...');
            textResponse = await callGemini('gemini-1.5-flash');
        } catch (e) {
            console.warn('gemini-1.5-flash failed, trying gemini-pro...', e);
            try {
                textResponse = await callGemini('gemini-pro');
            } catch (e2) {
                console.error('All models failed');
                lastError = e2;
            }
        }

        if (!textResponse) {
            throw lastError || new Error('Failed to generate content');
        }

        console.log('Gemini Raw Response:', textResponse);

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
