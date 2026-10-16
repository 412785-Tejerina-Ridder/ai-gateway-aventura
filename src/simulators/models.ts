export type Failure =
  | "success"
  | "provider-error"
  | "rate-limit"
  | "invalid"
  | "timeout"
  | "budget"
  | "access-denied";
export interface Attempt {
  candidate: string;
  result: Failure;
  elapsed: number;
}
export function simulateTutor(
  outcomes: Failure[],
  limit = 3,
  deadline = 6,
): {
  attempts: Attempt[];
  status: "success" | "stopped" | "exhausted" | "deadline";
  elapsed: number;
} {
  const attempts: Attempt[] = [];
  let elapsed = 0;
  for (let i = 0; i < Math.min(outcomes.length, limit, 3); i++) {
    if (elapsed >= deadline) return { attempts, status: "deadline", elapsed };
    const result = outcomes[i];
    const cost =
      result === "timeout"
        ? deadline - elapsed
        : Math.min(1.35, deadline - elapsed);
    elapsed += cost;
    attempts.push({ candidate: ["A", "B", "C"][i], result, elapsed });
    if (result === "success") return { attempts, status: "success", elapsed };
    // The toy candidates do not model independent provider/credential access.
    if (["invalid", "budget", "access-denied"].includes(result))
      return { attempts, status: "stopped", elapsed };
    if (elapsed >= deadline) return { attempts, status: "deadline", elapsed };
  }
  return { attempts, status: "exhausted", elapsed };
}
export type BreakerState = "working" | "resting" | "probing";
export class BreakerDemo {
  state: BreakerState = "working";
  failures = 0;
  calls = 0;
  skipped = 0;
  request(success = false) {
    if (this.state === "resting") {
      this.skipped++;
      return "skipped";
    }
    this.calls++;
    if (success) {
      this.failures = 0;
      this.state = "working";
      return "success";
    }
    this.failures++;
    if (this.state === "probing" || this.failures >= 3) this.state = "resting";
    return "failed";
  }
  wait() {
    if (this.state === "resting") this.state = "probing";
  }
}
export class TicketDemo {
  state: "idle" | "held" | "exposed" | "confirmed" | "released" = "idle";
  dispatches = 0;
  duplicates = 0;
  send() {
    if (this.state !== "idle") {
      this.duplicates++;
      return false;
    }
    this.state = "held";
    return true;
  }
  dispatch() {
    if (this.state === "held") {
      this.state = "exposed";
      this.dispatches++;
      return true;
    }
    return false;
  }
  resolve() {
    if (this.state === "exposed") this.state = "confirmed";
  }
  release() {
    if (this.state === "held") this.state = "released";
  }
}
