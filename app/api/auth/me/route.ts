import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, TokenPayload } from '@/lib/auth';

async function handler(_req: NextRequest, user: TokenPayload) {
    await dbConnect();
    const dbUser = await User.findById(user.userId).select('-passwordHash');
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: dbUser });
}

export const GET = withAuth(handler);
