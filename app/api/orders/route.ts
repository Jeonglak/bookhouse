import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: orders, error } = await query;

        if (error) {
            console.error('Supabase Fetch Error:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        // Map snake_case to camelCase for frontend
        const mappedOrders = orders?.map(order => ({
            id: order.id,
            userId: order.user_id,
            items: order.items,
            totalAmount: order.total_amount,
            totalPrice: order.total_amount, // Frontend uses totalPrice
            status: order.status,
            date: order.created_at,
            academyName: order.academy_name,
            contact: order.contact,
            request: order.request,
            totalQuantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        }));

        return NextResponse.json(mappedOrders);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const orderData = await request.json();

        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: orderData.userId,
                    items: orderData.items,
                    total_amount: orderData.totalPrice, // Frontend sends totalPrice
                    status: '주문접수',
                    academy_name: orderData.academyName,
                    contact: orderData.contact,
                    request: orderData.request
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase Order Insert Error:', error);
            return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
        }

        return NextResponse.json({ success: true, order: data });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json(); // Frontend sends 'id' for PATCH

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
