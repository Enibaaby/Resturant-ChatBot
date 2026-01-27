import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import path from 'path';
import { Order } from './models/Order';
import { PaystackService } from './services/PaystackService';

dotenv.config();

const app = express();

// Session Setup
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
});

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Payment Callback Route
app.get('/payment/callback', async (req, res) => {
    const { reference } = req.query;
    
    if (typeof reference === 'string') {
        const isValid = await PaystackService.verifyTransaction(reference);
        if (isValid) {
            await Order.findOneAndUpdate(
                { paymentReference: reference },
                { status: 'paid' }
            );
            // Redirect back to chat with success flag
            return res.redirect('/?status=success'); 
        }
    }
    res.redirect('/?status=failed');
});

export { app, sessionMiddleware };