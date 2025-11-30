'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookSearch from '@/components/BookSearch';
import OrderList from '@/components/OrderList';
import OrderForm from '@/components/OrderForm';
import AiSmartOrder from '@/components/AiSmartOrder';
import { Book, CartItem, User } from '@/types';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, [router]);

  const handleAddBook = (book: Book) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.isbn === book.isbn);
      if (existing) {
        return prev.map((item) =>
          item.isbn === book.isbn ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const handleAddAiItems = (items: any[]) => {
    setCartItems((prev) => {
      const newItems = [...prev];
      items.forEach((newItem) => {
        const existingIndex = newItems.findIndex((item) => item.title === newItem.title);
        if (existingIndex > -1) {
          newItems[existingIndex].quantity += newItem.quantity;
        } else {
          newItems.push(newItem);
        }
      });
      return newItems;
    });
  };

  const handleUpdateQuantity = (isbn: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.isbn === isbn) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (isbn: string) => {
    setCartItems((prev) => prev.filter((item) => item.isbn !== isbn));
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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <header className="mb-8 text-center relative">
          <h1 className="text-3xl font-bold text-navy-900" style={{ color: '#000080' }}>도서 주문 시스템</h1>
          <p className="mt-2 text-gray-600">필요한 도서를 검색하여 주문 목록에 담아주세요.</p>
          <div className="absolute top-0 right-0 flex gap-4 text-sm">
            <span className="text-gray-600">{user.academyName}님</span>
            <a href="/my-orders" className="text-blue-600 hover:underline">내 주문</a>
            {(user.username === 'admin' || user.username === '북하우스') && (
              <a href="/admin" className="text-gray-400 hover:text-gray-600">관리자</a>
            )}
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">로그아웃</button>
          </div>
        </header>

        <div className="space-y-8">
          <BookSearch onAddBook={handleAddBook} />
          <AiSmartOrder onAddItems={handleAddAiItems} />

          <div className="flex flex-col gap-8">
            <OrderList
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
            <OrderForm items={cartItems} user={user} />
          </div>
        </div>
      </div>
    </main>
  );
}
