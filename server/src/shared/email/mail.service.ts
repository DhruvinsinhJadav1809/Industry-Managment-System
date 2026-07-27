import { transporter } from "./transporter";
import { SendMailOptions } from "./interfaces/send-mail-options.interface";

class MailService {
  async send({ to, subject, html }: SendMailOptions): Promise<void> {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  }
}

export const mailService = new MailService();
