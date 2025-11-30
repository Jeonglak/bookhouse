'use client';

import { useState } from 'react';

interface LoginGateProps {
    onLogin: () => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            onLogin();
        } else {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-navy-900">도서 주문 시스템</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                            placeholder="비밀번호를 입력하세요"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-md bg-navy-700 px-4 py-2 text-white hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                        style={{ backgroundColor: '#000080' }} // Fallback/Explicit Navy
                    >
                        입장하기
                    </button>
                </form>
            </div>
        </div>
    );
}
