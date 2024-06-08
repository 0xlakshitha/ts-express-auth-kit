import express, { Application } from 'express'
import mongoose from 'mongoose'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import Controller from '@/utils/interfaces/controller.interface'
import ErrorMiddleware from '@/middleware/error.middleware'
import NotFoundMiddleware from '@/middleware/404.midlleware'
import helmet from 'helmet'
import { createServer } from 'http'
import logger from '@/utils/logger'
import { env } from '@/config/env'

class App {
    public express: Application
    public port: number
    public host: string
    public server: Awaited<ReturnType<typeof createServer>> | null = null
    private rocketEmoji = '\u{1F680}'

    constructor(controllers: Controller[], port: number, host: string) {
        this.express = express()
        this.port = port
        this.host = host

        this.initializeDatebaseConnction()
        this.initializeMiddleware()
        this.initializeControllers(controllers)
        this.initializeNotFoundMiddleware()
        this.initializeErrorHandling()
        this.createHttpServer()
    }

    private initializeMiddleware(): void {
        this.express.use(helmet())
        this.express.use(cors())
        this.express.use(morgan('dev'))
        this.express.use(express.json())
        this.express.use(express.urlencoded({ extended: false }))
        this.express.use(compression())
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use('/api', controller.router)
        })

        this.express.get('/health', (req, res) => {
            res.status(200).json({
                status: 'SERVER UP'
            })
        })
    }

    private initializeNotFoundMiddleware(): void {
        this.express.use(NotFoundMiddleware)
    }

    private initializeErrorHandling(): void {
        this.express.use(ErrorMiddleware)
    }

    private async initializeDatebaseConnction(): Promise<void> {
        await mongoose.connect(
            env.MONGO_URI
        )

        logger.info(`${this.rocketEmoji} Database connected.`)
    }

    private createHttpServer(): void {
        this.server = createServer(this.express)
    }

    public listen(): void {
        if(this.server === null) {
            logger.error('Server is not initialized')
            return
        }
        this.server.listen(this.port, () => {
            logger.info(`${this.rocketEmoji} App Runing On http://${this.host}:${this.port}`)
        })
    }

    public close(): void {
        if(this.server === null) {
            logger.error('Server is not initialized')
            return
        }
        this.server.close(() => {
            logger.info('Server Closed')
        })
    }
}


export default App
