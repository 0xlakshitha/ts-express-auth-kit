import nodemailer, { createTransport } from "nodemailer"
import { logger } from "./logger"
import { env } from "@/config/env"
import SMTPTransport from "nodemailer/lib/smtp-transport"

let mailer: nodemailer.Transporter<SMTPTransport.SentMessageInfo>

const getMailer = () => {
    if (mailer) {
        return mailer
    }

    mailer = createTransport({
        service: "gmail",
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        }
    })

    return mailer
}

interface MailOptions {
    to?: string
    subject?: string
    text?: string
    html?: string
}

export const sendMail = async (options: MailOptions) => {
    try {
        const mailer = getMailer()

        const info = await mailer.sendMail({
            from: `"NO REPLY" <${env.SMTP_USER}>`,
            ...options
        })

        logger.info(`Email sent: ${info.messageId}`)
    } catch (error) {
        console.log(error)
        logger.error(error)
    }
}