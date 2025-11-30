export interface Book {
    title: string;
    link: string;
    image: string;
    author: string;
    discount: string;
    publisher: string;
    pubdate: string;
    isbn: string;
    description: string;
}

export interface CartItem extends Book {
    quantity: number;
}

export interface User {
    id: string;
    username: string;
    academyName: string;
    contact: string;
}

export interface Order {
    id: string;
    userId: string;
    date: string;
    academyName: string;
    contact: string;
    request: string;
    items: CartItem[];
    totalQuantity: number;
    totalPrice: number;
    status: '주문접수' | '주문완료' | '취소됨';
}
