import { NextResponse } from "next/server";
import { verifyEntitlement } from "@/lib/entitlement/token";

/**
 * Sample of what the MOBILE APP does on first open: take the handoff token,
 * verify the signature + issuer/audience, and read the entitlement. Included
 * here so the web team can test tokens end-to-end (GET /api/entitlement/verify?token=…).
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
  }
  try {
    const claims = await verifyEntitlement(token);
    return NextResponse.json({ valid: true, claims });
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: (err as Error).message },
      { status: 401 },
    );
  }
}
