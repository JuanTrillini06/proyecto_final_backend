import nodemailer from "nodemailer";
import config from "../config/config.js";

class MailingService {
    constructor() {
        this.enabled = Boolean(config.mailerUser && config.mailerPassword);
        if (this.enabled) {
            this.transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: config.mailerUser,
                    pass: config.mailerPassword
                }
            });
        }
    }

    async sendPurchaseEmail({ to, subject, html }) {
        if (!this.enabled) {
            console.warn(
                "Servicio de mailing deshabilitado. Configure MAILER_USER y MAILER_PASSWORD."
            );
            return null;
        }

        const mailOptions = {
            from: config.mailerUser,
            to,
            subject,
            html
        };

        const result = await this.transporter.sendMail(mailOptions);
        return result;
    }
}

export const mailingService = new MailingService();
