import { NextResponse } from "next/server";
import { resolveWebPlans } from "@/lib/plans";

export async function GET() {
  const plans = await resolveWebPlans();
  return NextResponse.json(plans, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
