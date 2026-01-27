import axios from 'axios';
import { config } from '../config/env';

export class PaystackService {
    // Access keys securely from the config object
    private static secretKey = config.paystack.secretKey;

    static async initializeTransaction(email: string, amount: number, reference: string) {
        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: amount * 100, // Paystack expects amount in Kobo
                    reference,
                    // Uses the centralized Base URL (localhost or production domain)
                    callback_url: `${config.baseUrl}/payment/callback`
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.data.authorization_url;
        } catch (error) {
            console.error('Paystack Initialization Error:', error);
            return null;
        }
    }

    static async verifyTransaction(reference: string) {
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: { Authorization: `Bearer ${this.secretKey}` }
                }
            );
            
            // Returns true only if transaction status is explicitly 'success'
            return response.data.data.status === 'success';
        } catch (error) {
            console.error('Paystack Verification Error:', error);
            return false;
        }
    }
}