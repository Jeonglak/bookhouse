import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        const apiKey = process.env.OPENAI_API_KEY;
        const naverClientId = process.env.NAVER_CLIENT_ID;
        const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error: OPENAI_API_KEY is missing' }, { status: 500 });
        }

        if (!naverClientId || !naverClientSecret) {
            return NextResponse.json({ error: 'Server configuration error: Naver credentials missing' }, { status: 500 });
        }

        // 1. OpenAI Parsing
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

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

        if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            console.error('OpenAI API Error:', errorData);
            throw new Error(errorData.error?.message || `AI Error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        let parsedItems = [];

        try {
            const parsedJson = JSON.parse(content);
            parsedItems = Array.isArray(parsedJson) ? parsedJson : parsedJson.items || [];
        } catch (e) {
            console.error('JSON Parse Error:', e);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
        }

        // 2. Naver Search Integration
        const results = [];

        for (const item of parsedItems) {
            try {
                const searchRes = await fetch(`https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(item.title)}&display=1&sort=sim`, {
                    headers: {
                        'X-Naver-Client-Id': naverClientId,
                        'X-Naver-Client-Secret': naverClientSecret,
                    },
                });

                const searchData = await searchRes.json();

                if (searchData.items && searchData.items.length > 0) {
                    results.push({
                        type: 'success',
                        originalTitle: item.title,
                        quantity: item.quantity,
                        book: searchData.items[0]
                    });
                } else {
                    results.push({
                        type: 'failed',
                        title: item.title,
                        quantity: item.quantity
                    });
                }
            } catch (error) {
                console.error(`Search failed for ${item.title}:`, error);
                results.push({
                    type: 'failed',
                    title: item.title,
                    quantity: item.quantity
                });
            }
        }

        return NextResponse.json({ results });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Service error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
