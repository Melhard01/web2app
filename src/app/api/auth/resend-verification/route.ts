import { NextResponse } from "next/server";

type ResendVerificationPayload = {
  email?: unknown;
};

const DEFAULT_AUTH_BASE_URL = "http://40.89.185.79:4006";

function getResendVerificationUrl() {
  const explicit = process.env.AUTH_RESEND_VERIFICATION_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/resend-verification`;
}

export async function POST(req: Request) {
  let payload: ResendVerificationPayload;
  try {
    payload = (await req.json()) as ResendVerificationPayload;
  } catch {
    return NextResponse.json({ code: "INVALID_PAYLOAD", message: "Invalid request body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json(
      { code: "INVALID_PAYLOAD", message: "email is required." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(getResendVerificationUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const payloadFromAuth = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return NextResponse.json(payloadFromAuth, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "Authentication service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
