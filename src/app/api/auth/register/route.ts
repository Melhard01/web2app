import { NextResponse } from "next/server";

type RegisterPayload = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  password?: unknown;
};

const DEFAULT_AUTH_BASE_URL = "http://40.89.185.79:4006";

function getRegisterUrl() {
  const explicit = process.env.AUTH_REGISTER_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/register`;
}

export async function POST(req: Request) {
  let payload: RegisterPayload;
  try {
    payload = (await req.json()) as RegisterPayload;
  } catch {
    return NextResponse.json({ code: "INVALID_PAYLOAD", message: "Invalid request body." }, { status: 400 });
  }

  const firstName = typeof payload.firstName === "string" ? payload.firstName : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      {
        code: "INVALID_PAYLOAD",
        message: "firstName, lastName, email and password are required.",
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(getRegisterUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
      cache: "no-store",
    });

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
