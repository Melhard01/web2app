import { Polar } from "@polar-sh/sdk";
import { resolveMx } from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { polarProductIdFor, type BillingInterval } from "@/lib/config";

type PolarServer = "sandbox" | "production";
type PolarMetadataValue = string | number | boolean;
type PolarMetadata = Record<string, PolarMetadataValue>;
type OfferId = "lite" | "standard" | "pro";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log({
  polarServer: process.env.POLAR_SERVER,
  hasPolarAccessToken: Boolean(process.env.POLAR_ACCESS_TOKEN),
  liteMonthlyProduct: process.env.POLAR_PRODUCT_LITE_MONTH,
});

function parseServer(value: string | undefined): PolarServer | null {
  if (!value) return null;
  if (value === "sandbox" || value === "production") return value;
  return null;
}

function parseMetadata(raw: string | null) {
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return { error: "metadata must be a JSON object." as const };
    }
    const entries = Object.entries(parsed as Record<string, unknown>);
    for (const [key, value] of entries) {
      const type = typeof value;
      if (type !== "string" && type !== "number" && type !== "boolean") {
        return {
          error: `metadata.${key} must be string, number, or boolean.`,
        };
      }
    }
    return { value: parsed as PolarMetadata };
  } catch {
    return { error: "metadata must be valid JSON." as const };
  }
}

function normalizeProducts(url: URL) {
  const fromQuery = url.searchParams
    .getAll("products")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);

  return fromQuery;
}

function getStatusCode(error: unknown): number {
  if (typeof error !== "object" || error === null) return 500;
  const maybeCode = Number((error as { statusCode?: unknown }).statusCode);
  if (Number.isInteger(maybeCode) && maybeCode >= 100 && maybeCode <= 599) {
    return maybeCode === 0 ? 500 : maybeCode;
  }
  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown Polar checkout error.";
}

function parseOfferId(value: string | null): OfferId | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "lite" || normalized === "standard" || normalized === "pro") {
    return normalized;
  }
  return null;
}

function parseInterval(value: string | null): BillingInterval | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "month" || normalized === "year") {
    return normalized;
  }
  return null;
}

function extractEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");
  return atIndex === -1 ? "" : email.slice(atIndex + 1).toLowerCase();
}

async function emailDomainHasMx(domain: string) {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    const code = typeof error === "object" && error ? (error as { code?: string }).code : undefined;
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "SERVFAIL" || code === "EAI_AGAIN") {
      return false;
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
  const serverRaw = process.env.POLAR_SERVER?.trim();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  const successUrl =
    process.env.SUCCESS_URL?.trim() || `${appUrl}/success?checkout_id={CHECKOUT_ID}`;
  const returnUrl = `${appUrl}/paywall`;
  const server = parseServer(serverRaw);

  const missing: string[] = [];
  if (!accessToken) missing.push("POLAR_ACCESS_TOKEN");
  if (!serverRaw) missing.push("POLAR_SERVER");
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim() && !process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_APP_URL");
  }

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required environment variables: ${missing.join(", ")}` },
      { status: 500 },
    );
  }

  if (!server) {
    return NextResponse.json(
      { error: 'Invalid POLAR_SERVER. Allowed values are "sandbox" or "production".' },
      { status: 500 },
    );
  }

  let parsedSuccessUrl: string;
  let parsedReturnUrl: string;
  try {
    parsedSuccessUrl = new URL(successUrl).toString();
    parsedReturnUrl = new URL(returnUrl).toString();
  } catch {
    return NextResponse.json(
      { error: "Invalid app/success URL configuration in environment variables." },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const metadataResult = parseMetadata(url.searchParams.get("metadata"));
  if (metadataResult && "error" in metadataResult) {
    return NextResponse.json(
      { error: `Invalid metadata parameter: ${metadataResult.error}` },
      { status: 400 },
    );
  }
  const metadata = metadataResult?.value;

  const metadataOfferId =
    metadata && typeof metadata.offerId === "string" ? parseOfferId(metadata.offerId) : null;
  const metadataInterval =
    metadata && typeof metadata.interval === "string" ? parseInterval(metadata.interval) : null;

  const offerIdFromQuery = url.searchParams.get("offerId");
  const intervalFromQuery = url.searchParams.get("interval");
  const offerId = parseOfferId(offerIdFromQuery) ?? metadataOfferId;
  const interval = parseInterval(intervalFromQuery) ?? metadataInterval;

  if (offerIdFromQuery && !parseOfferId(offerIdFromQuery)) {
    return NextResponse.json(
      { error: 'Invalid offerId parameter. Allowed values: "lite", "standard", "pro".' },
      { status: 400 },
    );
  }
  if (intervalFromQuery && !parseInterval(intervalFromQuery)) {
    return NextResponse.json(
      { error: 'Invalid interval parameter. Allowed values: "month", "year".' },
      { status: 400 },
    );
  }
  if ((offerId && !interval) || (!offerId && interval)) {
    return NextResponse.json(
      { error: 'offerId and interval must be provided together (or included in metadata).' },
      { status: 400 },
    );
  }

  const selectedProductId = offerId && interval ? polarProductIdFor(offerId, interval) : undefined;
  if (offerId && interval && !selectedProductId) {
    return NextResponse.json(
      {
        error: `Missing environment mapping for ${offerId}/${interval}. Expected POLAR_PRODUCT_${offerId.toUpperCase()}_${interval.toUpperCase()}.`,
      },
      { status: 500 },
    );
  }

  const products = selectedProductId ? [selectedProductId] : normalizeProducts(url);
  if (products.length === 0) {
    return NextResponse.json(
      { error: "Missing products parameter. Provide products or valid offerId + interval." },
      { status: 400 },
    );
  }

  const invalidProduct = products.find((id) => !UUID_RE.test(id));
  if (invalidProduct) {
    return NextResponse.json(
      { error: `Invalid products parameter "${invalidProduct}". Expected Polar product UUID(s).` },
      { status: 400 },
    );
  }

  console.log({
    polarServer: server,
    offerId: offerId ?? null,
    interval: interval ?? null,
    selectedProductId: selectedProductId ?? products[0] ?? null,
    hasPolarAccessToken: Boolean(process.env.POLAR_ACCESS_TOKEN),
  });

  const customerEmailRaw = url.searchParams.get("customerEmail");
  const customerEmail = customerEmailRaw?.trim().toLowerCase();
  if (customerEmailRaw !== null && !customerEmail) {
    return NextResponse.json(
      { error: "Invalid customerEmail parameter. Expected a non-empty value." },
      { status: 400 },
    );
  }
  if (customerEmail && !EMAIL_RE.test(customerEmail)) {
    return NextResponse.json(
      { error: "Invalid customerEmail parameter. Expected a valid email address." },
      { status: 400 },
    );
  }
  if (customerEmail) {
    const domain = extractEmailDomain(customerEmail);
    const hasValidDomain = domain ? await emailDomainHasMx(domain) : false;
    if (!hasValidDomain) {
      return NextResponse.json(
        {
          code: "INVALID_EMAIL_DOMAIN",
          message: "This email domain does not exist. Check your email address.",
        },
        { status: 400 },
      );
    }
  }

  const customerNameRaw = url.searchParams.get("customerName");
  const customerName = customerNameRaw?.trim();
  if (customerNameRaw !== null && !customerName) {
    return NextResponse.json(
      { error: "Invalid customerName parameter. Expected a non-empty value." },
      { status: 400 },
    );
  }

  const polar = new Polar({
    accessToken,
    server,
  });

  try {
    const checkout = await polar.checkouts.create({
      products,
      successUrl: decodeURI(parsedSuccessUrl),
      returnUrl: decodeURI(parsedReturnUrl),
      customerEmail: customerEmail || undefined,
      customerName: customerName || undefined,
      metadata,
    });

    const redirectUrl = new URL(checkout.url);
    redirectUrl.searchParams.set("theme", "light");
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    const status = getStatusCode(error);
    const message = getErrorMessage(error);
    console.error("[Polar Checkout] create failed", {
      status,
      server,
      message,
      rawError: error,
    });
    return NextResponse.json(
      { error: "Failed to create Polar checkout session.", details: message },
      { status: status || 500 },
    );
  }
}
