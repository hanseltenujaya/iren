import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
    orderId: string;
    packerId: Types.ObjectId;
    beforeUrl: string;
    afterUrl: string;
    status: 'pending' | 'completed' | 'failed';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        orderId: { type: String, required: true, trim: true, index: true },
        packerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        beforeUrl: { type: String, required: true },
        afterUrl: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed',
        },
        notes: { type: String },
    },
    { timestamps: true }
);

// Compound index for the most common dashboard query: filter by date range + packer
TransactionSchema.index({ createdAt: -1, packerId: 1 });

const Transaction =
    mongoose.models.Transaction ||
    mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
