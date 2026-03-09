import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import { withAuth, TokenPayload } from '@/lib/auth';

const PAGE_SIZE = 24; // 3 columns × 8 rows

// GET /api/gallery?orderId=&page=
async function gallery(req: NextRequest, _user: TokenPayload) {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get('orderId');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

    const filter: Record<string, unknown> = {};
    if (orderId) filter.orderId = { $regex: orderId.trim(), $options: 'i' };

    const [items, total] = await Promise.all([
        Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .populate('packerId', 'name phone')
            .select('orderId beforeUrl afterUrl packerId createdAt'),
        Transaction.countDocuments(filter),
    ]);

    return NextResponse.json({
        items,
        pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    });
}

export const GET = withAuth(gallery);
