import { NextResponse } from "next/server";

type VerifyOtpPayload = {
  email?: unknown;
  otp?: unknown;
  challengeId?: unknown;
};

const DEFAULT_AUTH_BASE_URL = "http://40.89.185.79:4006";

function getVerifyOtpUrl() {
  const explicit = process.env.AUTH_VERIFY_OTP_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/verify-email`;
}

function getLegacyVerifyOtpUrl() {
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/verify-otp`;
}

export async function POST(req: Request) {
  let payload: VerifyOtpPayload;
  try {
    payload = (await req.json()) as VerifyOtpPayload;
  } catch {
    return NextResponse.json({ code: "INVALID_PAYLOAD", message: "Invalid request body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const otp = typeof payload.otp === "string" ? payload.otp : "";
  const challengeId = typeof payload.challengeId === "string" ? payload.challengeId : undefined;

  if (!email || !otp) {
    return NextResponse.json(
      {
        code: "INVALID_PAYLOAD",
        message: "email and otp are required.",
      },
      { status: 400 },
    );
  }

  try {
    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
        ...(challengeId ? { challengeId } : {}),
      }),
      cache: "no-store",
    };

    let response = await fetch(getVerifyOtpUrl(), requestInit);
    // Backward-compatible retry for environments still exposing /verify-otp.
    if (response.status === 404 && !process.env.AUTH_VERIFY_OTP_URL?.trim()) {
      response = await fetch(getLegacyVerifyOtpUrl(), requestInit);
    }

    const contentType = response.headers.get("content-type") || "";
    const payloadFromAuth = contentType.includes("application/json")
      ? await response.json()
      : {
          message: await response.text(),
        };

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
