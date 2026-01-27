import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { app, sessionMiddleware } from './app';
import { BotService } from './services/BotService';

const server = http.createServer(app);
const io = new Server(server);

// Share session with Socket.io
const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

io.on('connection', (socket: any) => {
    const session = socket.request.session;
    console.log(`User connected: ${session.id}`);

    // Send initial options on connection if not started
    if(!session.hasStarted) {
        BotService.processMessage(session, "init").then(response => {
            socket.emit('bot-message', response);
            session.save();
        });
    }

    socket.on('user-message', async (msg: string) => {
        const response = await BotService.processMessage(session, msg);
        session.save(); // Save session changes (cart updates)
        socket.emit('bot-message', response);
    });
});

// Database & Server Start
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('MongoDB Connected');
        server.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => console.error(err));