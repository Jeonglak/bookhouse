'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FindAccountPage() {
    const [activeTab, setActiveTab] = useState<'find-id' | 'find-password'>('find-id');
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        contact: '',
    });
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);
        setError(null);

        try {
            const res = await fetch('/api/auth/find-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeTab,
                    ...formData,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                if (activeTab === 'find-id') {
                    setResult(`회원님의 아이디는 [ ${data.username} ] 입니다.`);
                } else {
                    setResult(`회원님의 비밀번호는 [ ${data.password} ] 입니다.`);
                }
            } else {
                setError(data.message || '정보를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-navy-900" style={{ color: '#000080' }}>계정 찾기</h2>
                    <p className="mt-2 text-gray-600">아이디 또는 비밀번호를 잊으셨나요?</p>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-2 text-center font-medium ${activeTab === 'find-id' ? 'border-b-2 border-navy-800 text-navy-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => { setActiveTab('find-id'); setResult(null); setError(null); }}
                        style={{ borderColor: activeTab === 'find-id' ? '#000080' : undefined, color: activeTab === 'find-id' ? '#000080' : undefined }}
                    >
                        아이디 찾기
                    </button>
                    <button
                        className={`flex-1 py-2 text-center font-medium ${activeTab === 'find-password' ? 'border-b-2 border-navy-800 text-navy-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => { setActiveTab('find-password'); setResult(null); setError(null); }}
                        style={{ borderColor: activeTab === 'find-password' ? '#000080' : undefined, color: activeTab === 'find-password' ? '#000080' : undefined }}
                    >
                        비밀번호 찾기
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {activeTab === 'find-password' && (
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
                        )}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름 (학원명)</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">전화번호</label>
                            <input
                                id="contact"
                                name="contact"
                                type="text"
                                required
                                placeholder="010-0000-0000"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {result && (
                        <div className="rounded-md bg-green-50 p-4 text-center text-sm font-medium text-green-800">
                            {result}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-center text-sm font-medium text-red-800">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-md bg-navy-800 px-4 py-2 text-white hover:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                        style={{ backgroundColor: '#000080' }}
                    >
                        {activeTab === 'find-id' ? '아이디 찾기' : '비밀번호 찾기'}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <Link href="/login" className="font-medium text-navy-600 hover:text-navy-500" style={{ color: '#000080' }}>
                        로그인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
