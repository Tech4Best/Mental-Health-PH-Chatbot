import { CRISIS_TRIGGER_PHRASES, CRISIS_RESPONSE_MESSAGE } from "./constants";

export function detectCrisis(message: string): {
  isCrisis: boolean;
  response: string | null;
} {
  const lower = message.toLowerCase();

  for (const phrase of CRISIS_TRIGGER_PHRASES) {
    if (lower.includes(phrase)) {
      return { isCrisis: true, response: CRISIS_RESPONSE_MESSAGE };
    }
  }

  return { isCrisis: false, response: null };
}
