'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin1234') {
            setIsAuthenticated(true);
            fetchOrders();
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.username === 'admin' || user.username === '북하우스') {
                setIsAuthenticated(true);
                fetchOrders();
            }
        }
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (res.ok) {
                // Optimistic update or refetch
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus as any } : order
                ));
            } else {
                alert('상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update status', error);
            alert('오류가 발생했습니다.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">관리자 로그인</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                            placeholder="관리자 비밀번호"
                        />
                        <button
                            type="submit"
                            className="w-full rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                        >
                            접속
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">주문 내역 관리</h1>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                    >
                        메인으로 돌아가기
                    </button>
                </div>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-lg font-bold text-navy-900" style={{ color: '#000080' }}>{order.academyName}</h2>
                                        <select
                                            value={order.status || '주문접수'}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`rounded border px-2 py-1 text-sm font-bold ${order.status === '주문완료' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    order.status === '취소됨' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        'bg-blue-100 text-blue-800 border-blue-200'
                                                }`}
                                        >
                                            <option value="주문접수">주문접수</option>
                                            <option value="주문완료">주문완료</option>
                                            <option value="취소됨">취소됨</option>
                                        </select>
                                    </div>
                                    <p className="text-sm text-gray-600">연락처: {order.contact}</p>
                                    <p className="text-sm text-gray-600">주문일시: {new Date(order.date).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">총 {order.totalQuantity}권</p>
                                    <p className="text-blue-600">{order.totalPrice.toLocaleString()}원</p>
                                </div>
                            </div>

                            {order.request && (
                                <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                                    <strong>요청사항:</strong> {order.request}
                                </div>
                            )}

                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">책 제목</th>
                                        <th className="px-4 py-2">수량</th>
                                        <th className="px-4 py-2">가격</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="border-b last:border-0">
                                            <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                                            <td className="px-4 py-2">{item.quantity}</td>
                                            <td className="px-4 py-2">{(item.discount ? parseInt(item.discount) : 0).toLocaleString()}원</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            아직 접수된 주문이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
