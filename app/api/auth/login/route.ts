import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '아이디와 비밀번호를 입력해주세요.' },
                { status: 400 }
            );
        }

        // Hardcoded Admin Login
        if (username === '북하우스' && password === '1234') {
            return NextResponse.json({
                success: true,
                user: {
                    username: '북하우스',
                    name: '관리자',
                    academyName: '북하우스',
                    contact: '010-0000-0000'
                },
            });
        }

        // Find user by username and password
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password) // Note: In production, verify hash!
            .single();

        if (error || !user) {
            return NextResponse.json(
                { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
                { status: 401 }
            );
        }

        // Return user info (excluding password) and map fields
        const { password: _, ...userWithoutPassword } = user;

        const mappedUser = {
            ...userWithoutPassword,
            academyName: user.academy_name, // Map snake_case to camelCase
        };

        return NextResponse.json({
            success: true,
            user: mappedUser,
        });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { success: false, message: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
