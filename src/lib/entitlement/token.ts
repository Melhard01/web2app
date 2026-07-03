import { SignJWT, jwtVerify } from "jose";

/**
 * Signed entitlement token = the bridge between the web purchase and the app.
 * The web funnel mints it after a successful (mock or real) payment; the mobile
 * app verifies the signature on first open (the “deep-link token” / silent
 * recognition step in the flow) and unlocks without a second charge.
 *
 * MOCK NOTE: in this scaffold the token is signed with a shared HS256 secret and
 * the "account" is in-memory. In production the secret would live only on the
 * server, the token would be single-use (jti tracked + revocable), and the app
 * would verify against the same key (or a public key if you move to RS256).
 */

const SECRET = new TextEncoder().encode(
  process.env.ENTITLEMENT_TOKEN_SECRET ?? "dev-only-insecure-secret-change-me",
);

const ISSUER = "epiminded-web";
const AUDIENCE = "epiminded-app";

export interface EntitlementClaims {
  /** Stable account id provisioned at purchase. */
  accountId: string;
  /** Email the purchase is bound to. */
  email: string;
  /** Plan identifier (e.g. "Community + Personalized"). */
  plan: string;
  /** Tier within the plan (e.g. "Standard"). */
  tier: string;
  /** Billing interval, e.g. "month" | "year". */
  interval: string;
  /** Whether the voice-print add-on is included. */
  addon: boolean;
  /** Where the entitlement originated. */
  source: "web";
  /** Single-use token id (for revocation / replay protection). */
  jti: string;
}

/** Mint a short-lived, single-use entitlement token for the handoff. */
export async function signEntitlement(
  claims: EntitlementClaims,
  ttlSeconds = 60 * 60 * 24 * 7, // 7 days — long enough to install + open
): Promise<string> {
  return new SignJWT({
    email: claims.email,
    plan: claims.plan,
    tier: claims.tier,
    interval: claims.interval,
    addon: claims.addon,
    source: claims.source,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.accountId)
    .setJti(claims.jti)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(SECRET);
}

/** Verify + decode an entitlement token (used by a sample verify endpoint). */
export async function verifyEntitlement(token: string): Promise<EntitlementClaims> {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return {
    accountId: String(payload.sub),
    email: String(payload.email),
    plan: String(payload.plan),
    tier: String(payload.tier),
    interval: String(payload.interval),
    addon: Boolean(payload.addon),
    source: "web",
    jti: String(payload.jti),
  };
}
