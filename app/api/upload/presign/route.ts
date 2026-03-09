import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { withAuth, TokenPayload } from '@/lib/auth';

const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

// POST /api/upload/presign
// Body: { filename: string, contentType: string }
// Returns: { uploadUrl, publicUrl, key }
async function presign(req: NextRequest, user: TokenPayload) {
    try {
        const { filename, contentType } = await req.json();
        if (!filename || !contentType) {
            return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 });
        }

        // Build a unique key: userId/YYYY-MM/timestamp-filename
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const key = `uploads/${user.userId}/${month}/${Date.now()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: contentType,
        });

        // Pre-signed PUT URL valid for 15 minutes
        const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 900 });

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return NextResponse.json({ uploadUrl, publicUrl, key });
    } catch (err) {
        console.error('Presign error:', err);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}

export const POST = withAuth(presign);
