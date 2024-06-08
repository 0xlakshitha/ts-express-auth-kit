import 'dotenv/config'
import 'module-alias/register'
import App from './app'
import { env } from '@/config/env'


async function main () {
    const app = new App([

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