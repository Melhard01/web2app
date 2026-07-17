import { NextResponse } from "next/server";

type JoinCommunityPayload = {
  userId?: unknown;
  code?: unknown;
};

const DEFAULT_AUTH_BASE_URL = "http://40.89.185.79:5044";

function getJoinCommunityUrl() {
  const explicit = process.env.AUTH_JOIN_COMMUNITY_BY_CODE_URL?.trim();
  if (explicit) return explicit;
  return `${DEFAULT_AUTH_BASE_URL}/join-community-by-code`;
}

export async function POST(req: Request) {
  let payload: JoinCommunityPayload;
  try {
    payload = (await req.json()) as JoinCommunityPayload;
  } catch {
    return NextResponse.json({ code: "INVALID_PAYLOAD", message: "Invalid request body." }, { status: 400 });
  }

  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const code = typeof payload.code === "string" ? payload.code.trim() : "";

  if (!userId || !code) {
    return NextResponse.json(
      {
        code: "INVALID_PAYLOAD",
        message: "userId and code are required.",
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(getJoinCommunityUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        code,
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
        message: "Community service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
