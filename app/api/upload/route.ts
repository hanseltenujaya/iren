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
});

// POST /api/upload
// Accepts multipart/form-data with fields: file (binary), filename (string)
// Returns { publicUrl, key }
async function uploadFile(req: NextRequest, user: TokenPayload) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const filename = (formData.get('filename') as string | null) ?? `upload_${Date.now()}.jpg`;

        if (!file) {
            return NextResponse.json({ error: 'file is required' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const key = `uploads/${user.userId}/${month}/${Date.now()}-${filename}`;

        await R2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: 'image/jpeg',
            })
        );

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
        return NextResponse.json({ publicUrl, key });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export const POST = withAuth(uploadFile);
