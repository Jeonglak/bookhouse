import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

function getUsers(): User[] {
    if (!fs.existsSync(dataFilePath)) {
        return [];
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (e) {
        return [];
    }
}

function saveUsers(users: any[]) {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

export async function POST(request: Request) {
    try {
        const { username, password, academyName, contact } = await request.json();

        if (!username || !password || !academyName || !contact) {
            return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
        }

        const users = getUsers();

        if (users.find((u) => u.username === username)) {
            return NextResponse.json({ error: '이미 존재하는 아이디입니다.' }, { status: 409 });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password, // In a real app, hash this!
            academyName,
            contact,
        };

        users.push(newUser);
        saveUsers(users);

        // Return user info without password
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
