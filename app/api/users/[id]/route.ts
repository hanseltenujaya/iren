import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, TokenPayload } from '@/lib/auth';

// PATCH /api/users/[id] — update user details or module permissions
async function patchUser(
    req: NextRequest,
    _user: TokenPayload,
    id: string
) {
    try {
        await dbConnect();
        const body = await req.json();
        const allowedFields = ['name', 'role', 'modules', 'isActive', 'password'];
        const update: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === 'password') {
                    update.passwordHash = await bcrypt.hash(body.password, 12);
                } else {
                    update[field] = body[field];
                }
            }
        }

        const updated = await User.findByIdAndUpdate(id, update, { new: true }).select(
            '-passwordHash'
        );

        if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json({ user: updated });
    } catch (err) {
        console.error('Update user error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Next.js 16 — params is a Promise in dynamic routes
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    return withAuth((r, u) => patchUser(r, u, id), ['manager'])(req);
}

// DELETE /api/users/[id] — delete a user (manager only)
async function deleteUser(
    _req: NextRequest,
    _user: TokenPayload,
    id: string
) {
    try {
        await dbConnect();
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    return withAuth((r, u) => deleteUser(r, u, id), ['manager'])(req);
}
