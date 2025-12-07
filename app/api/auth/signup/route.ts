import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
    try {
        const formData = await request.json();
        const { username, password, name, academyName, contact } = formData;

        if (!username || !password || !academyName || !contact) {
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
                { success: false, message: '이미 존재하는 아이디입니다.' },
                { status: 409 }
            );
        }

        // 2. Insert new user
        const { error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    username,
                    password,
                    name: formData.name || academyName, // Use academyName as name if name is not provided, or handle name separately
                    academy_name: academyName,
                    contact: formData.contact,
                },
            ]);

        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            return NextResponse.json(
                { success: false, message: '회원가입 처리에 실패했습니다.' },
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
