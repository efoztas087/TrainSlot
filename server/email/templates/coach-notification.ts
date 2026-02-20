export function coachNotificationTemplate(input: {
  clientName: string;
  serviceName: string;
  startAt: string;
  paymentStatus: string;
}) {
  return `
    <h2>New booking received</h2>
    <p>Client: ${input.clientName}</p>
    <p>Service: ${input.serviceName}</p>
    <p>When: ${new Date(input.startAt).toLocaleString()}</p>
    <p>Payment status: ${input.paymentStatus}</p>
  `;
}
