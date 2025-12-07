import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
    try {
        const { username, password, name, academyName } = await request.json();

        if (!username || !password || !name) {
            return NextResponse.json(
                { success: false, message: '필수 정보가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // 1. Check if user exists
        const { data: existingUser, error: searchError } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Signup Error:', error);
        return NextResponse.json(
            { success: false, message: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
