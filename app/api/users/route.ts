import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, TokenPayload } from '@/lib/auth';

// GET /api/users — list all users (manager/admin only)
async function getUsers(_req: NextRequest, _user: TokenPayload) {
    await dbConnect();
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
    return NextResponse.json({ users });
}

// POST /api/users — create a new packer (manager only)
async function createUser(req: NextRequest, _user: TokenPayload) {
    try {
        const { phone, password, name, role, modules } = await req.json();

        if (!phone || !password || !name) {
            return NextResponse.json(
                { error: 'phone, password, and name are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const exists = await User.findOne({ phone: phone.trim() });
        if (exists) {
            return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            phone: phone.trim(),
            passwordHash,
            name: name.trim(),
            role: role ?? 'packer',
            modules: modules ?? ['scan-pack'],
        });

        return NextResponse.json(
            {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    phone: newUser.phone,
                    role: newUser.role,
                    modules: newUser.modules,
                },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error('Create user error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withAuth(getUsers, ['manager', 'admin']);
export const POST = withAuth(createUser, ['manager']);
