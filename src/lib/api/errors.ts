/**
 * Error raised for any non-2xx backend response. The backend always answers
 * `{ success: false, code, message, errors? }`, where `errors` holds Zod field errors
 * (`{ field: string[] }`) for validation failures.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, code: string, message: string, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = flattenFieldErrors(errors);
  }
}

function flattenFieldErrors(errors: unknown): Record<string, string> {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === "string") out[key] = value[0];
    else if (typeof value === "string") out[key] = value;
  }
  return out;
}

/** Messages people can act on, for the error codes the UI is most likely to meet. */
const FRIENDLY: Record<string, string> = {
  INVALID_CREDENTIALS: "That email and password don't match. Check them and try again.",
  ADMIN_LOGIN_REQUIRED: "This is a DocDuniya staff account. Sign in through the administrator portal.",
  ACCOUNT_NOT_VERIFIED: "Please verify your email before signing in.",
  ACCOUNT_DISABLED: "This account has been disabled. Contact support for help.",
  ACCOUNT_LOCKED: "Too many failed attempts. Your account is locked for 15 minutes.",
  USER_EXISTS: "An account with this email already exists. Try signing in instead.",
  OTP_INVALID: "That code isn't right. Check the latest email and try again.",
  OTP_EXPIRED: "That code has expired. Request a new one.",
  OTP_MAX_ATTEMPTS: "Too many attempts. Request a new code.",
  OTP_COOLDOWN: "Please wait a minute before requesting another code.",
  SLOT_UNAVAILABLE: "Someone just booked that slot. Please pick another time.",
  QUOTE_CHANGED: "The price or service changed a moment ago. Review the details and try again.",
  PAYMENT_NOT_READY: "Payment hasn't been confirmed yet.",
  VERSION_CONFLICT: "This record changed in the meantime. Refresh and try again.",
  CONFLICT: "This record changed in the meantime. Refresh and try again.",
  MFA_ENROLLMENT_REQUIRED: "Set up two-factor authentication in Settings to use this feature.",
  CREDENTIAL_INVALID: "Your professional credential isn't currently valid for this action.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
};

export function friendlyMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) {
    if (error.code === "API_UNREACHABLE") {
      return process.env.NODE_ENV === "production"
        ? "We can't reach DocDuniya right now. Please try again in a moment."
        : `Can't reach the backend at ${process.env.API_URL ?? "http://localhost:4000/api/v1 (default)"}. Is it running, and does API_URL in .env.local point to it?`;
    }
    if (error.status === 429) return FRIENDLY.RATE_LIMITED;
    if (error.status >= 500) return "Our servers had a problem. Please try again in a moment.";
    return FRIENDLY[error.code] ?? error.message ?? fallback;
  }
  return fallback;
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;
export const isUnauthorized = (error: unknown) =>
  error instanceof ApiError && error.status === 401;
export const isForbidden = (error: unknown) => error instanceof ApiError && error.status === 403;
