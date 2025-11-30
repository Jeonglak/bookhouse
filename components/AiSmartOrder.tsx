'use client';

import { useState } from 'react';
import { Book } from '@/types';

interface AiSmartOrderProps {
    onAddItems: (items: any[]) => void;
}

export default function AiSmartOrder({ onAddItems }: AiSmartOrderProps) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [processedItems, setProcessedItems] = useState<any[]>([]); // Stores both success and failed items

    const handleProcess = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setProcessedItems([]); // Clear previous results
        try {
            // 1. Parse Text
            const res = await fetch('/api/parse-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();

            if (!data.items) {
                const errorMessage = data.details || data.error || '분석에 실패했습니다.';
                alert(`오류: ${errorMessage}\n(서버 재시작이 필요할 수 있습니다)`);
                setLoading(false);
                return;
            }

            const initialItems = data.items;
            const newProcessedItems: any[] = [];

            // 2. Search and Match
            for (const item of initialItems) {
                try {
                    const searchRes = await fetch(`/api/search?query=${encodeURIComponent(item.title)}`);
                    const searchData = await searchRes.json();

                    if (searchData.items && searchData.items.length > 0) {
                        const bestMatch = searchData.items[0];
                        newProcessedItems.push({
                            type: 'success',
                            originalTitle: item.title,
                            quantity: Number(item.quantity),
                            book: bestMatch
                        });
                    } else {
                        newProcessedItems.push({
                            type: 'failed',
                            title: item.title,
                            quantity: Number(item.quantity)
                        });
                    }
                } catch (err) {
                    console.error(`Failed to search for ${item.title}`, err);
                    newProcessedItems.push({
                        type: 'failed',
                        title: item.title,
                        quantity: Number(item.quantity)
                    });
                }
            }

            setProcessedItems(newProcessedItems);

        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (index: number) => {
        const item = processedItems[index];
        if (item.type === 'success' && item.book) {
            onAddItems([{
                ...item.book,
                quantity: item.quantity
            }]);
            // Remove from list after adding
            handleRemoveItem(index);
        }
    };

    const handleAddAllSuccess = () => {
        const successItems = processedItems
            .filter(item => item.type === 'success')
            .map(item => ({
                ...item.book,
                quantity: item.quantity
            }));

        if (successItems.length > 0) {
            onAddItems(successItems);
            // Keep only failed items
            setProcessedItems(processedItems.filter(item => item.type !== 'success'));
            alert(`${successItems.length}건이 장바구니에 추가되었습니다.`);
        }
    };

    const handleUpdateFailedItem = (index: number, field: string, value: string | number) => {
        const newItems = [...processedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setProcessedItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setProcessedItems(processedItems.filter((_, i) => i !== index));
    };

    // Retry for a specific failed item
    const handleRetryItem = async (index: number) => {
        const item = processedItems[index];
        if (item.type !== 'failed') return;

        setLoading(true);
        try {
            const searchRes = await fetch(`/api/search?query=${encodeURIComponent(item.title)}`);
            const searchData = await searchRes.json();

            if (searchData.items && searchData.items.length > 0) {
                const bestMatch = searchData.items[0];
                const newItems = [...processedItems];
                newItems[index] = {
                    type: 'success',
                    originalTitle: item.title,
                    quantity: item.quantity,
                    book: bestMatch
                };
                setProcessedItems(newItems);
            } else {
                alert('여전히 검색 결과가 없습니다. 도서명을 확인해주세요.');
            }
        } catch (error) {
            console.error(error);
            alert('검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-navy-900" style={{ color: '#000080' }}>AI 스마트 주문</h2>
            <p className="mb-4 text-sm text-gray-600">
                주문 내용을 입력하면 AI가 도서를 검색해줍니다. 결과를 확인하고 장바구니에 담아주세요.
            </p>

            <div className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                    rows={5}
                    placeholder="예시: 쎈 수1 3권, 마플 시너지 수2 2개 주문요"
                />

                <button
                    onClick={handleProcess}
                    disabled={loading}
                    className="w-full rounded-md bg-navy-700 px-4 py-2 text-white hover:bg-navy-800 disabled:bg-gray-400"
                    style={{ backgroundColor: loading ? '#9ca3af' : '#000080' }}
                >
                    {loading ? '분석 및 검색 중...' : 'AI 주문 분석 시작'}
                </button>
            </div>

            {processedItems.length > 0 && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">분석 결과 ({processedItems.length}건)</h3>
                        {processedItems.some(i => i.type === 'success') && (
                            <button
                                onClick={handleAddAllSuccess}
                                className="text-sm text-blue-600 hover:underline font-medium"
                            >
                                확인된 도서 전체 추가
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {processedItems.map((item, idx) => (
                            <div key={idx} className={`flex items-start gap-3 rounded-md p-3 border ${item.type === 'success' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                                {item.type === 'success' ? (
                                    <>
                                        {/* Success Item UI */}
                                        <div className="relative h-20 w-14 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                            {item.book.image ? (
                                                <img src={item.book.image} alt={item.book.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate" dangerouslySetInnerHTML={{ __html: item.book.title }} />
                                            <p className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: item.book.author }} />
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-sm font-bold text-blue-700">
                                                    {item.book.discount ? `${Number(item.book.discount).toLocaleString()}원` : '가격미정'}
                                                </span>
                                                <span className="text-xs text-gray-500">x {item.quantity}권</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddItem(idx)}
                                            className="self-center rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 whitespace-nowrap"
                                        >
                                            추가
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Failed Item UI */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">확인 필요</span>
                                                <span className="text-xs text-gray-500">검색 실패</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => handleUpdateFailedItem(idx, 'title', e.target.value)}
                                                    className="flex-1 rounded border border-red-300 px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
                                                    placeholder="도서명 수정"
                                                />
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateFailedItem(idx, 'quantity', Number(e.target.value))}
                                                    className="w-14 rounded border border-red-300 px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => handleRetryItem(idx)}
                                                    className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
                                                >
                                                    재검색
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="text-gray-400 hover:text-red-500 self-center px-2"
                                        >
                                            ✕
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
