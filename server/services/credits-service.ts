export function applyCreditsDeduction(input: { creditsRemaining: number; creditsCost: number }) {
  if (input.creditsCost <= 0) {
    return {
      creditsDeducted: 0,
      nextCredits: input.creditsRemaining,
      paymentStatus: "PAID" as const
    };
  }

  if (input.creditsRemaining >= input.creditsCost) {
    return {
      creditsDeducted: input.creditsCost,
      nextCredits: input.creditsRemaining - input.creditsCost,
      paymentStatus: "PAID" as const
    };
  }

  return {
    creditsDeducted: 0,
    nextCredits: input.creditsRemaining,
    paymentStatus: "UNPAID" as const
  };
}
