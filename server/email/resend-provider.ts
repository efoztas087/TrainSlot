import { Resend } from "resend";
import type { EmailPayload, EmailProvider } from "@/server/email/provider";

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(apiKey: string, from: string) {
    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async send(payload: EmailPayload) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    });

    if (error) {
      throw new Error(`Resend delivery failed: ${error.message}`);
    }
  }
}
