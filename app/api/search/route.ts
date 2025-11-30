import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    console.log('Search Query:', query);
    console.log('Client ID:', clientId ? 'Present' : 'Missing');
    console.log('Client Secret:', clientSecret ? 'Present' : 'Missing');

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const response = await fetch(`https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}&display=10&sort=sim`, {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
        });

        console.log('Naver API Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Naver API Error:', errorText);
            return NextResponse.json({ error: 'Failed to fetch from Naver API', details: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log('Naver API Data Items:', data.items ? data.items.length : 'No items');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
