import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
    try {
        const { type, username, name, contact } = await request.json();

        if (type === 'find-id') {
            const { data, error } = await supabase
                .from('users')
                .select('username')
                .eq('name', name)
                .eq('contact', contact)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { success: false, message: '일치하는 사용자 정보를 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, username: data.username });
        } else if (type === 'find-password') {
            const { data, error } = await supabase
                .from('users')
                .select('password')
                .eq('username', username)
                .eq('name', name)
                .eq('contact', contact)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { success: false, message: '일치하는 사용자 정보를 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, password: data.password });
        }

        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    } catch (error) {
        console.error('Find Account Error:', error);
        return NextResponse.json(
            { success: false, message: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
