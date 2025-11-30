'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Order } from '@/types';

export default function MyOrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchOrders(parsedUser.id);
        }
    }, [router]);

    const fetchOrders = async (userId: string) => {
        try {
            const res = await fetch(`/api/orders?userId=${userId}`);
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-navy-900" style={{ color: '#000080' }}>내 주문 내역</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            주문하러 가기
                        </button>
                        <button onClick={handleLogout} className="text-red-500 hover:text-red-700">로그아웃</button>
                    </div>
                </div>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.status === '주문완료' ? 'bg-green-100 text-green-800' :
                                                order.status === '취소됨' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.status || '주문접수'}
                                        </span>
                                        <p className="text-sm text-gray-600">주문일시: {new Date(order.date).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-600">연락처: {order.contact}</p>
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

                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="flex-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                                        <span className="w-16 text-right">{item.quantity}권</span>
                                        <span className="w-24 text-right">{(item.discount ? parseInt(item.discount) : 0).toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            아직 주문 내역이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
