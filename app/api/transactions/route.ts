import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import { withAuth, TokenPayload } from '@/lib/auth';

const PAGE_SIZE = 20;

// GET /api/transactions?orderId=&packerId=&dateFrom=&dateTo=&page=
async function getTransactions(req: NextRequest, _user: TokenPayload) {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get('orderId');
    const packerId = searchParams.get('packerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

    // Build MongoDB filter
    const filter: Record<string, unknown> = {};
    if (orderId) filter.orderId = { $regex: orderId, $options: 'i' };
    if (packerId) filter.packerId = packerId;
    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) (filter.createdAt as Record<string, Date>).$gte = new Date(dateFrom);
        if (dateTo) (filter.createdAt as Record<string, Date>).$lte = new Date(dateTo);
    }

    const [transactions, total] = await Promise.all([
        Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .populate('packerId', 'name phone'),
        Transaction.countDocuments(filter),
    ]);

    return NextResponse.json({
        transactions,
        pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    });
}

// POST /api/transactions — create a transaction record (from Flutter app)
async function createTransaction(req: NextRequest, user: TokenPayload) {
    try {
        const { orderId, beforeUrl, afterUrl, notes, packerId } = await req.json();

        if (!orderId || !beforeUrl || !afterUrl) {
            return NextResponse.json(
                { error: 'orderId, beforeUrl, and afterUrl are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const tx = await Transaction.create({
            orderId: orderId.trim(),
            packerId: packerId ?? user.userId, // Flutter app may pass explicit packerId
            beforeUrl,
            afterUrl,
            notes,
            status: 'completed',
        });

        return NextResponse.json({ transaction: tx }, { status: 201 });
    } catch (err) {
        console.error('Create transaction error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withAuth(getTransactions);
export const POST = withAuth(createTransaction);
