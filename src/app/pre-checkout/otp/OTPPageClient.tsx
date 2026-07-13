"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { useFunnel } from "@/lib/funnel/store";

type AuthApiPayload = {
  code?: string;
  message?: string;
  error?: string;
  challengeId?: string;
};

type PendingSignup = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  challengeId?: string | null;
};

const PENDING_SIGNUP_STORAGE_KEY = "epiminded.pendingSignup.v1";

function normalizeAuthMessage(payload: AuthApiPayload | null) {
  const raw = payload?.message || payload?.error || "";
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

export function OTPPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = searchParams.get("products") ?? "";
  const offerId = searchParams.get("offerId");
  const interval = searchParams.get("interval");
  const { setCustomerName, setEmail } = useFunnel();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpTouched, setOtpTouched] = useState(false);
  const [otpInfoMessage, setOtpInfoMessage] = useState(
    "We sent a verification code to your email. Enter it to continue.",
  );
  const [backendErrors, setBackendErrors] = useState<{
    otp?: string;
    general?: string;
  }>({});
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_SIGNUP_STORAGE_KEY);
      if (!raw) {
        setBackendErrors({
          general: "Signup session expired. Please fill your details again.",
        });
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PendingSignup>;
      if (!parsed.firstName || !parsed.lastName || !parsed.email || !parsed.password) {
        setBackendErrors({
          general: "Signup session is incomplete. Please fill your details again.",
        });
      } else {
        setPendingSignup({
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email: parsed.email,
          password: parsed.password,
          challengeId: parsed.challengeId ?? null,
        });
      }
    } catch {
      setBackendErrors({
        general: "Could not read signup session. Please try again.",
      });
    } finally {
      setHydrated(true);
    }
  }, []);

  const otpClean = otpCode.trim();
  const otpError = !otpClean ? "Please enter the OTP code" : null;
  const hasProduct = Boolean(products);

  const buildCheckoutUrl = useMemo(() => {
    if (!pendingSignup) return "";
    const metadata = JSON.stringify({
      firstName: pendingSignup.firstName,
      lastName: pendingSignup.lastName,
      email: pendingSignup.email,
      offerId: offerId ?? null,
      interval: interval ?? null,
      addon: false,
    });

    const params = new URLSearchParams();
    params.set("products", products);
    if (offerId) params.set("offerId", offerId);
    if (interval) params.set("interval", interval);
    params.set("customerEmail", pendingSignup.email);
    params.set("customerName", `${pendingSignup.firstName} ${pendingSignup.lastName}`);
    params.set("metadata", metadata);
    return `/checkout?${params.toString()}`;
  }, [pendingSignup, products, offerId, interval]);

  const parseAuthPayload = async (response: Response): Promise<AuthApiPayload | null> => {
    return (await response.json().catch(() => null)) as AuthApiPayload | null;
  };

  const onVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !pendingSignup) return;
    setOtpTouched(true);
    setBackendErrors({});

    if (otpError) {
      setBackendErrors({ otp: otpError });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingSignup.email,
          otp: otpClean,
          ...(pendingSignup.challengeId ? { challengeId: pendingSignup.challengeId } : {}),
        }),
      });
      const payload = await parseAuthPayload(response);

      if (!response.ok) {
        const normalizedMessage = normalizeAuthMessage(payload);
        if (normalizedMessage.includes("already verified")) {
          setCustomerName(pendingSignup.firstName, pendingSignup.lastName);
          setEmail(pendingSignup.email);
          window.location.assign(buildCheckoutUrl);
          return;
        }
        if (
          payload?.code === "INVALID_OTP" ||
          payload?.code === "OTP_INVALID" ||
          payload?.code === "OTP_EXPIRED" ||
          payload?.code === "OTP_ATTEMPTS_EXCEEDED" ||
          normalizedMessage.includes("invalid or expired verification code")
        ) {
          setBackendErrors({
            otp: "Invalid or expired verification code. Request a new OTP and try again.",
          });
          return;
        }
        setBackendErrors({
          general: payload?.message || payload?.error || "Unable to verify OTP right now.",
        });
        return;
      }

      setCustomerName(pendingSignup.firstName, pendingSignup.lastName);
      setEmail(pendingSignup.email);
      window.location.assign(buildCheckoutUrl);
    } catch {
      setBackendErrors({
        general: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendOtp = async () => {
    if (isSubmitting || !pendingSignup) return;
    setIsSubmitting(true);
    setBackendErrors({});

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingSignup.email,
        }),
      });
      const payload = await parseAuthPayload(response);

      if (!response.ok) {
        setBackendErrors({
          general: payload?.message || payload?.error || "Unable to resend OTP right now.",
        });
        return;
      }

      const nextChallengeId =
        typeof payload?.challengeId === "string" && payload.challengeId
          ? payload.challengeId
          : pendingSignup.challengeId ?? null;

      const updated: PendingSignup = {
        ...pendingSignup,
        challengeId: nextChallengeId,
      };
      setPendingSignup(updated);
      try {
        sessionStorage.setItem(PENDING_SIGNUP_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // non-fatal
      }
      setOtpInfoMessage("A new verification code was sent to your email.");
      setBackendErrors({});
    } catch {
      setBackendErrors({
        general: "Unable to resend OTP right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={1} />
      <main className="mx-auto w-full max-w-[900px] px-8 pb-20 pt-12 sm:px-12 sm:pt-16">
        <div className="mb-6 flex justify-center">
          <span className="inline-block rounded-full border border-gold/40 px-5 py-2 font-mono text-[12px] uppercase tracking-eyebrow text-gold">
            Step 3 · Verify OTP
          </span>
        </div>

        <h1 className="m-0 mb-4 font-display text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
          Enter your verification code
        </h1>
        <p className="m-0 mb-10 max-w-[38em] text-[17px] leading-[1.6] text-ash">{otpInfoMessage}</p>

        <form
          onSubmit={onVerifyOtp}
          className="rounded-[28px] border border-gold/60 bg-[#050505] p-8 shadow-[0_0_0_1px_rgba(212,175,55,0.15)] sm:p-10"
          noValidate
        >
          {!hasProduct && (
            <p className="mb-6 rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-sm text-[#f0bbbb]">
              Missing product selection. Please return to the pricing page.
            </p>
          )}

          {backendErrors.general && (
            <p className="mb-6 rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-sm text-[#f0bbbb]">
              {backendErrors.general}
            </p>
          )}

          {hydrated && !pendingSignup && !backendErrors.general && (
            <p className="mb-6 rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-sm text-[#f0bbbb]">
              Signup session expired. Please return and submit your details again.
            </p>
          )}

          <label className="mt-5 block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
              OTP code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value);
                setBackendErrors((prev) => ({ ...prev, otp: undefined, general: undefined }));
              }}
              onBlur={() => setOtpTouched(true)}
              className="w-full rounded-xl border border-line bg-card px-4 py-3 text-[16px] text-body outline-none transition focus:border-gold"
              placeholder="Enter 6-digit OTP"
              required
            />
            {(otpTouched || isSubmitting) && otpError && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{otpError}</span>
            )}
            {backendErrors.otp && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{backendErrors.otp}</span>
            )}
          </label>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-full bg-gold-cta px-5 font-sans text-[14px] font-semibold text-[#15110A] transition hover:bg-gold-hi disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-7 sm:text-[16px]"
              disabled={!hasProduct || !pendingSignup || isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Verify OTP and continue"}
            </button>
            <button
              type="button"
              onClick={onResendOtp}
              disabled={!pendingSignup || isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-card px-4 font-sans text-[14px] font-semibold text-body transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-6 sm:text-[15px]"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => router.push("/pre-checkout")}
              className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-card px-4 font-sans text-[14px] font-semibold text-body transition hover:border-gold sm:h-12 sm:px-6 sm:text-[15px]"
            >
              Back to details
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
