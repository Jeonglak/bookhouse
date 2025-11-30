'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                // Save user info to localStorage (simple session management)
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('로그인되었습니다.');
                if (data.user.username === '북하우스') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                alert(data.error || '로그인 실패');
            }
        } catch (error) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
                    <p className="mt-2 text-gray-600">도서 주문 시스템에 오신 것을 환영합니다.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">아이디</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-navy-800 px-4 py-2 text-white hover:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                        style={{ backgroundColor: '#000080' }}
                    >
                        로그인
                    </button>
                </form>
                <div className="text-center text-sm">
                    <a href="/signup" className="font-medium text-navy-600 hover:text-navy-500" style={{ color: '#000080' }}>
                        계정이 없으신가요? 회원가입
                    </a>
                </div>
            </div>
        </div>
    );
}
