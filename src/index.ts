import 'dotenv/config'
import 'module-alias/register'
import App from './app'
import { env } from '@/config/env'
import AuthController from './app/auth/auth.controller'


async function main () {
    const app = new App([
        new AuthController()
    ], Number(env.PORT), env.HOST)

    app.listen()

    const signals = ["SIGINT", "SIGTERM"]

    signals.forEach(signal => {
        process.on(signal, () => {
            gracefulShutdown(app)
        })
    })
}

async function gracefulShutdown(app: App) {
    app.close()
}

main()