import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (!apiKey) {
            console.error('API Key missing');
            return NextResponse.json({ error: 'Server configuration error: OPENAI_API_KEY is missing' }, { status: 500 });
        }

        const systemPrompt = `
      You are a book order parser. Convert the user's input text into a JSON Array of book orders.
      
      Rules:
      1. Extract 'title' and 'quantity' (number).
      2. Default quantity is 1 if not specified.
      3. Correct typos (e.g., '공수' -> '공통수학', '쏀' -> '쎈').
      4. Ignore greetings or irrelevant text.
      5. Output ONLY the JSON Array. No markdown, no explanations.

      Examples:
      Input: "쎈 수1 3권, 마플 시너지 수2"
      Output: {"items": [{"title": "쎈 수1", "quantity": 3}, {"title": "마플 시너지 수2", "quantity": 1}]}

      Input: "개념원리 대수"
      Output: {"items": [{"title": "개념원리 대수", "quantity": 1}]}
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        console.log('OpenAI Raw Response:', content);

        try {
            const parsedData = JSON.parse(content);
            // Handle both array and object wrapper formats
            const items = Array.isArray(parsedData) ? parsedData : parsedData.items || [];
            return NextResponse.json({ items });
        } catch (e) {
            console.error('JSON Parse Error:', e);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
        }

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: 'AI service error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
