type ReviewEnvironment = { NODE_ENV?: string; NONRESIDENT_COMPANY_LOCAL_REVIEW?: string; VERCEL?: string; FIREBASE_APP_HOSTING?: string; K_SERVICE?: string; CI?: string };

/** Deliberately cannot be enabled in production, CI, Vercel or Cloud Run/App Hosting. */
export function isNonresidentReviewEnabled(env: ReviewEnvironment): boolean {
  return env.NODE_ENV === "development"
    && env.NONRESIDENT_COMPANY_LOCAL_REVIEW === "true"
    && !env.VERCEL && !env.FIREBASE_APP_HOSTING && !env.K_SERVICE && !env.CI;
}
