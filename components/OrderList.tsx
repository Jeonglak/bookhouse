'use client';

import { CartItem } from '@/types';

interface OrderListProps {
    items: CartItem[];
    onUpdateQuantity: (isbn: string, quantity: number) => void;
    onRemove: (isbn: string) => void;
}

export default function OrderList({ items, onUpdateQuantity, onRemove }: OrderListProps) {
    const totalPrice = items.reduce((sum, item) => {
        const price = item.discount ? parseInt(item.discount) : 0;
        return sum + price * item.quantity;
    }, 0);

    if (items.length === 0) {
        return (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-gray-200 text-center text-gray-500">
                주문 목록이 비어있습니다.
            </div>
        );
    }

    return (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">주문 목록</h2>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">이미지</th>
                            <th scope="col" className="px-6 py-3">책 제목</th>
                            <th scope="col" className="px-6 py-3">정가</th>
                            <th scope="col" className="px-6 py-3">수량</th>
                            <th scope="col" className="px-6 py-3">합계</th>
                            <th scope="col" className="px-6 py-3">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const price = item.discount ? parseInt(item.discount) : 0;
                            return (
                                <tr key={item.isbn} className="border-b bg-white hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="relative h-16 w-12 bg-gray-100">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: item.title }} />
                                    <td className="px-6 py-4">{price.toLocaleString()}원</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.isbn, parseInt(e.target.value) || 1)}
                                            className="w-20 rounded-md border border-gray-300 px-2 py-1 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600">{(price * item.quantity).toLocaleString()}원</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onRemove(item.isbn)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 font-semibold text-gray-900">
                            <td className="px-6 py-3" colSpan={4}>총 예상 금액</td>
                            <td className="px-6 py-3" colSpan={2}>{totalPrice.toLocaleString()}원</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {items.map((item) => {
                    const price = item.discount ? parseInt(item.discount) : 0;
                    return (
                        <div key={item.isbn} className="flex gap-4 rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="relative h-24 w-16 flex-shrink-0 bg-gray-100">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                                    <p className="text-sm text-gray-500 mt-1">{price.toLocaleString()}원</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.isbn, parseInt(e.target.value) || 1)}
                                            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-navy-500 focus:outline-none"
                                        />
                                        <span className="text-sm font-bold text-blue-600">{(price * item.quantity).toLocaleString()}원</span>
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.isbn)}
                                        className="text-sm text-red-600 hover:text-red-900 px-2 py-1"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between items-center font-bold text-gray-900">
                        <span>총 예상 금액</span>
                        <span className="text-lg text-blue-700">{totalPrice.toLocaleString()}원</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
