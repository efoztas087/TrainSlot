export function bookingConfirmationTemplate(input: {
  coachName: string;
  serviceName: string;
  startAt: string;
  cancelUrl: string;
}) {
  return `
    <h2>Booking confirmed</h2>
    <p>Your session with <strong>${input.coachName}</strong> is confirmed.</p>
    <p>Service: ${input.serviceName}</p>
    <p>When: ${new Date(input.startAt).toLocaleString()}</p>
    <p>If needed, cancel using this secure link:</p>
    <p><a href="${input.cancelUrl}">${input.cancelUrl}</a></p>
  `;
}
