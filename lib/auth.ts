import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
    userId: string;
    phone: string;
    role: 'packer' | 'admin' | 'manager';
    name: string;
}

/** Sign a JWT that expires in 7 days */
export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** Verify and decode a JWT from the Authorization header */
export function verifyToken(req: NextRequest): TokenPayload {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) throw new Error('No token provided');
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Route handler wrapper that enforces authentication and optional role checks.
 *
 * Usage:
 *   export const GET = withAuth(handler, ['manager', 'admin']);
 */
export function withAuth(
    handler: (req: NextRequest, user: TokenPayload) => Promise<NextResponse>,
    allowedRoles?: Array<'packer' | 'admin' | 'manager'>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            const user = verifyToken(req);
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            return handler(req, user);
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    };
}
