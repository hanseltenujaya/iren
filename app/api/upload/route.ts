import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, TokenPayload } from '@/lib/auth';

const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Required for R2: prevents bucket name being prepended to hostname
});

// POST /api/upload
// Body (JSON): { filename: string, contentType: string, data: string (base64) }
// Returns: { publicUrl, key }
async function uploadFile(req: NextRequest, user: TokenPayload) {
    try {
        const { filename, contentType, data } = await req.json();

        if (!filename || !data) {
            return NextResponse.json({ error: 'filename and data are required' }, { status: 400 });
        }

        const buffer = Buffer.from(data, 'base64');

        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const key = `uploads/${user.userId}/${month}/${Date.now()}-${filename}`;

        await R2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: contentType ?? 'image/jpeg',
            })
        );

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
        return NextResponse.json({ publicUrl, key });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: `Upload failed: ${String(err)}` }, { status: 500 });
    }
}

export const POST = withAuth(uploadFile);
