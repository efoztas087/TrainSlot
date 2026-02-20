export function reminderTemplate(input: { coachName: string; serviceName: string; startAt: string }) {
  return `
    <h2>Reminder: upcoming training session</h2>
    <p>Your session with ${input.coachName} starts at <strong>${new Date(input.startAt).toLocaleString()}</strong>.</p>
    <p>Service: ${input.serviceName}</p>
  `;
}
