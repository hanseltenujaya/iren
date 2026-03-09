import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    phone: string;
    passwordHash: string;
    name: string;
    role: 'packer' | 'admin' | 'manager';
    modules: string[];
    isActive: boolean;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        phone: { type: String, required: true, unique: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        role: { type: String, enum: ['packer', 'admin', 'manager'], default: 'packer' },
        // list of module keys this user can access, e.g. ['scan-pack', 'gallery']
        modules: { type: [String], default: ['scan-pack'] },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Prevent model duplicate registration error in hot-reload/dev
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
