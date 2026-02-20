import { createHash, randomBytes } from "node:crypto";

export function generateCancelToken() {
  const raw = randomBytes(24).toString("hex");
  return {
    raw,
    hash: createHash("sha256").update(raw).digest("hex")
  };
}
