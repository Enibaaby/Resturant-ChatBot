import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    sessionId: string;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'cancelled';
    paymentReference?: string;
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    sessionId: { type: String, required: true },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    paymentReference: { type: String },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);