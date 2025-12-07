'use client';

import { useState, useEffect } from 'react';
import { CartItem, User } from '@/types';

interface OrderFormProps {
    items: CartItem[];
    user: User;
}

export default function OrderForm({ items, user }: OrderFormProps) {
    const [academyName, setAcademyName] = useState(user?.academyName || '');
    const [contact, setContact] = useState(user?.contact || '');
    const [request, setRequest] = useState('');

    useEffect(() => {
        if (user) {
            setAcademyName(user.academyName);
            setContact(user.contact);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleOrder = () => {
        if (items.length === 0) {
            alert('주문할 책을 목록에 추가해주세요.');
            return;
        }
        // Even though inputs are hidden, we check if data exists (it should from user prop)
        if (!academyName.trim() || !contact.trim()) {
            alert('사용자 정보(학원명, 연락처)가 없습니다. 관리자에게 문의하세요.');
            return;
        }

        const orderText = `[도서 주문]
학원명: ${academyName}
연락처: ${contact}
요청사항: ${request || '없음'}

[주문 목록]
${items.map((item, index) => `${index + 1}. ${item.title.replace(/<[^>]*>?/gm, '')} (수량: ${item.quantity})`).join('\n')}

총 ${items.reduce((sum, item) => sum + item.quantity, 0)}권`;

        // 1. Copy to clipboard
        navigator.clipboard.writeText(orderText).then(() => {
            // 2. Submit to server
            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    academyName,
                    contact,
                    request,
                    items,
                    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
                    totalPrice: items.reduce((sum, item) => sum + (item.discount ? parseInt(item.discount) : 0) * item.quantity, 0),
                }),
            }).then(res => {
                if (res.ok) {
                    alert('주문 내용이 복사되었으며, 서버에 저장되었습니다.\n이메일이나 카카오톡에 붙여넣어 보내주세요.');
                } else {
                    alert('주문 내용이 복사되었습니다. (서버 저장 실패)');
                }
            }).catch(err => {
                console.error('Server submit error:', err);
                alert('주문 내용이 복사되었습니다. (서버 저장 오류)');
            });

        }).catch((err) => {
            console.error('Failed to copy: ', err);
            alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.\n\n' + orderText);
        });
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">주문 정보 입력</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="request" className="block text-sm font-medium text-gray-700">배송 요청사항</label>
                    <textarea
                        id="request"
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                        placeholder="배송 관련 요청사항을 입력하세요"
                    />
                </div>
                <button
                    onClick={handleOrder}
                    className="w-full rounded-md bg-navy-800 px-4 py-3 text-lg font-bold text-white hover:bg-navy-900 shadow-md transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#000080' }}
                >
                    주문하기 (클립보드 복사)
                </button>
            </div>
        </div>
    );
}
