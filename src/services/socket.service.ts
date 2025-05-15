import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";


export class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;
    public connections: string[] = []

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }

        return SocketService.instance;
    }

    public initialize(server: HttpServer): void {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        this.setupEventListeners();
        this.setupMiddleware();
        logger.info('🚀 Socket initialized');
    }

    private setupEventListeners(): void {
        if (!this.io) {
            logger.error('Socket is not initialized');
            return;
        }

        this.io.on('connection', (socket) => {
            logger.info('a user connected');
            this.connections.push(socket.id);

            socket.on('disconnect', () => {
                logger.info('user disconnected');
                this.connections = this.connections.filter((id) => id !== socket.id);
            });

            socket.on('message', (data) => {
                logger.info(`Received message from ${socket.id}:`, data)
                socket.broadcast.emit('message', {
                    from: socket.id,
                    data
                })
            })
        });
    }

    private setupMiddleware(): void {
        if (!this.io) {
            logger.error('Socket is not initialized');
            return;
        }

        this.io.use((socket, next) => {
            logger.info('Middleware called');
            next();
        });
    }

    public emit(event: string, data: any): void {
        if (!this.io) {
            logger.error('Socket.IO not initialized')
            return
        }
        this.io.emit(event, data)
    }

    public close(): void {
        if (this.io) {
            this.io.close()
            logger.info('Socket.IO connections closed')
        }
    }

    public getIO(): Server | null {
        return this.io
    }
}

export default SocketService.getInstance();