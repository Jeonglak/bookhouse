import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

// Helper to read data
function getOrders() {
    if (!fs.existsSync(dataFilePath)) {
        return [];
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (e) {
        return [];
    }
}

// Helper to write data
function saveOrders(orders: any[]) {
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const orders = getOrders();

    if (userId) {
        const userOrders = orders.filter((order: any) => order.userId === userId);
        // Sort by date desc
        userOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return NextResponse.json(userOrders);
    }

    // Admin view: all orders sorted by date desc
    orders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const orders = getOrders();

        const newOrder = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: '주문접수', // Default status
            ...body,
        };

        orders.unshift(newOrder); // Add to beginning
        saveOrders(orders);

        return NextResponse.json({ success: true, order: newOrder });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;
        const orders = getOrders();

        const orderIndex = orders.findIndex((order: any) => order.id === id);
        if (orderIndex === -1) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        orders[orderIndex].status = status;
        saveOrders(orders);

        return NextResponse.json({ success: true, order: orders[orderIndex] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
