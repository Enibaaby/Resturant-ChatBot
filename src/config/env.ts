import dotenv from 'dotenv';

// Load .env file contents into process.env
dotenv.config();

// validation: Ensure critical keys are present before starting
const requiredEnvs = [
    'MONGO_URI', 
    'SESSION_SECRET', 
    'PAYSTACK_SECRET_KEY', 
    'PAYSTACK_PUBLIC_KEY'
];

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ FATAL ERROR: Missing required environment variable: ${key}`);
        process.exit(1); // Stop server immediately if config is missing
    }
});

// Export a clean configuration object
export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI as string,
    sessionSecret: process.env.SESSION_SECRET as string,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY as string,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY as string
    }
};