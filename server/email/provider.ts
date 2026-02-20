export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(payload: EmailPayload) {
    console.log("[email:console]", payload.to, payload.subject);
  }
}
