'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types';
import Image from 'next/image';

interface BookSearchProps {
    onAddBook: (book: Book) => void;
}

export default function BookSearch({ onAddBook }: BookSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                searchBooks(query);
            } else {
                setResults([]);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchBooks = async (searchQuery: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.items) {
                setResults(data.items);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">도서 검색</h2>
            <div className="mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="책 제목을 입력하세요 (자동 검색)"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                />
                {loading && <p className="mt-2 text-sm text-gray-500">검색 중...</p>}
            </div>

            <div className="space-y-4">
                {results.map((book) => (
                    <div key={book.isbn} className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0">
                        <div className="relative h-24 w-16 flex-shrink-0 bg-gray-100">
                            {book.image ? (
                                <Image
                                    src={book.image}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: book.title }} />
                            <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: book.author }} />
                            <p className="text-sm font-medium text-blue-600">
                                {book.discount ? `${Number(book.discount).toLocaleString()}원` : '가격 정보 없음'}
                            </p>
                        </div>
                        <button
                            onClick={() => onAddBook(book)}
                            className="rounded-md border border-navy-600 px-3 py-1 text-sm text-navy-600 hover:bg-navy-50"
                            style={{ borderColor: '#000080', color: '#000080' }}
                        >
                            추가
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
