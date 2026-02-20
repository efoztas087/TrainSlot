import { describe, expect, it } from "vitest";
import { applyCreditsDeduction } from "@/server/services/credits-service";

describe("applyCreditsDeduction", () => {
  it("deducts credits and marks paid when wallet has enough credits", () => {
    const result = applyCreditsDeduction({ creditsRemaining: 8, creditsCost: 2 });

    expect(result.creditsDeducted).toBe(2);
    expect(result.nextCredits).toBe(6);
    expect(result.paymentStatus).toBe("PAID");
  });

  it("leaves wallet unchanged and marks unpaid when credits are insufficient", () => {
    const result = applyCreditsDeduction({ creditsRemaining: 1, creditsCost: 3 });

    expect(result.creditsDeducted).toBe(0);
    expect(result.nextCredits).toBe(1);
    expect(result.paymentStatus).toBe("UNPAID");
  });

  it("marks paid when service costs zero credits", () => {
    const result = applyCreditsDeduction({ creditsRemaining: 0, creditsCost: 0 });

    expect(result.creditsDeducted).toBe(0);
    expect(result.nextCredits).toBe(0);
    expect(result.paymentStatus).toBe("PAID");
  });
});
