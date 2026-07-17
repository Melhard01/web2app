"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { useFunnel } from "@/lib/funnel/store";
import {
  normalizeSignupValues,
  validateConfirmPassword,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "@/lib/validation/signup";

type AuthApiPayload = {
  code?: string;
  message?: string;
  error?: string;
  challengeId?: string;
  id_user?: string;
};

const PENDING_SIGNUP_STORAGE_KEY = "epiminded.pendingSignup.v1";

function normalizeAuthMessage(payload: AuthApiPayload | null) {
  const raw = payload?.message || payload?.error || "";
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function EyeOpenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M2 12C3.9 8.4 7.6 6 12 6s8.1 2.4 10 6c-1.9 3.6-5.6 6-10 6S3.9 15.6 2 12z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeClosedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M2 12C3.9 8.4 7.6 6 12 6s8.1 2.4 10 6c-1.9 3.6-5.6 6-10 6S3.9 15.6 2 12z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function PreCheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = searchParams.get("products") ?? "";
  const {
    selected,
    firstName: storedFirstName,
    lastName: storedLastName,
    email: storedEmail,
    setCustomerName,
    setEmail,
    setRegisteredAuth,
  } = useFunnel();

  const [firstName, setFirstName] = useState(storedFirstName ?? "");
  const [lastName, setLastName] = useState(storedLastName ?? "");
  const [email, updateEmail] = useState(storedEmail ?? "");
  const [communityId, setCommunityId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [backendFieldErrors, setBackendFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { firstName: firstNameClean, lastName: lastNameClean, email: emailClean } =
    normalizeSignupValues({
      firstName,
      lastName,
      email,
    });

  const hasProduct = Boolean(products);
  const firstNameError = validateFirstName(firstName);
  const lastNameError = validateLastName(lastName);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password, {
    firstName: firstNameClean,
    lastName: lastNameClean,
    email: emailClean,
  });
  const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
  const firstNameOk = firstNameError === null;
  const lastNameOk = lastNameError === null;
  const emailOk = emailError === null;
  const passwordOk = passwordError === null;
  const confirmPasswordOk = confirmPasswordError === null;

  const formValid =
    hasProduct &&
    firstNameOk &&
    lastNameOk &&
    emailOk &&
    passwordOk &&
    confirmPasswordOk;

  const selectedLabel = useMemo(() => {
    if (!selected) return null;
    return `${selected.offerId} (${selected.interval})`;
  }, [selected]);

  const buildOtpPageUrl = () => {
    const params = new URLSearchParams();
    params.set("products", products);
    if (selected?.offerId) params.set("offerId", selected.offerId);
    if (selected?.interval) params.set("interval", selected.interval);
    return `/pre-checkout/otp?${params.toString()}`;
  };

  const parseAuthPayload = async (response: Response): Promise<AuthApiPayload | null> => {
    return (await response.json().catch(() => null)) as AuthApiPayload | null;
  };

  const mapRegisterErrorToField = (payload: AuthApiPayload | null) => {
    const normalizedMessage = normalizeAuthMessage(payload);
    switch (payload?.code) {
      case "INVALID_EMAIL_DOMAIN":
        return { email: "This email domain does not exist. Check your email address" };
      case "EMAIL_ALREADY_USED":
        return { email: "An account already exists with this email address" };
      default:
        if (normalizedMessage.includes("user already exists")) {
          return { email: "An account already exists with this email address" };
        }
        return { general: payload?.message || payload?.error || "Unable to register right now." };
    }
  };

  const handleRegisterAndSendOtp = async () => {
    const communityIdClean = communityId.trim();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstNameClean,
        lastName: lastNameClean,
        email: emailClean,
        password,
      }),
    });
    const payload = await parseAuthPayload(response);

    if (!response.ok) {
      setBackendFieldErrors((prev) => ({ ...prev, ...mapRegisterErrorToField(payload) }));
      return false;
    }

    setCustomerName(firstNameClean, lastNameClean);
    setEmail(emailClean);
    const registeredUserId = typeof payload?.id_user === "string" ? payload.id_user : null;
    setRegisteredAuth(registeredUserId);

    if (communityIdClean && registeredUserId) {
      try {
        const joinCommunityResponse = await fetch("/api/auth/join-community-by-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: registeredUserId,
            code: communityIdClean,
          }),
        });

        if (!joinCommunityResponse.ok) {
          const joinCommunityPayload = (await joinCommunityResponse.json().catch(() => null)) as
            | AuthApiPayload
            | null;
          console.error("[Community Join] Request failed", {
            status: joinCommunityResponse.status,
            userId: registeredUserId,
            message: joinCommunityPayload?.message || joinCommunityPayload?.error || null,
          });
        }
      } catch (error) {
        console.error("[Community Join] Request error", {
          userId: registeredUserId,
          error,
        });
      }
    }

    try {
      sessionStorage.setItem(
        PENDING_SIGNUP_STORAGE_KEY,
        JSON.stringify({
          firstName: firstNameClean,
          lastName: lastNameClean,
          email: emailClean,
          password,
          communityId: communityIdClean || null,
          challengeId:
            typeof payload?.challengeId === "string" && payload.challengeId ? payload.challengeId : null,
          registeredUserId,
        }),
      );
    } catch {
      // non-fatal session storage issue
    }

    setBackendFieldErrors((prev) => ({ ...prev, general: undefined }));
    router.push(buildOtpPageUrl());
    return true;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitted(true);
    setBackendFieldErrors({});
    if (!formValid) return;
    setIsSubmitting(true);

    try {
      await handleRegisterAndSendOtp();
    } catch {
      setBackendFieldErrors((prev) => ({
        ...prev,
        general: "Something went wrong. Please try again.",
      }));
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
            Step 2 · Your details
          </span>
        </div>

        <h1 className="m-0 mb-4 font-display text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
          Before checkout, tell us where to send your access
        </h1>
        <p className="m-0 mb-10 max-w-[38em] text-[17px] leading-[1.6] text-ash">
          We will use these details for your purchase and access confirmation.
        </p>

        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-gold/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.02)_100%)] p-8 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.16),0_14px_36px_rgba(0,0,0,0.5)] sm:p-10"
          noValidate
        >
          {backendFieldErrors.general && (
            <p className="mb-6 rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-sm text-[#f0bbbb]">
              {backendFieldErrors.general}
            </p>
          )}
          {!hasProduct && (
            <p className="mb-6 rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-sm text-[#f0bbbb]">
              Missing product selection. Please return to the pricing page.
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
                First name
              </span>
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setBackendFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                onBlur={() => setFirstNameTouched(true)}
                className="w-full rounded-xl border border-line bg-card px-4 py-3 text-[16px] text-body outline-none transition focus:border-gold"
                placeholder="First name"
                required
              />
              {(submitted || firstNameTouched) && firstNameError && (
                <span className="mt-2 block text-sm text-[#f0bbbb]">{firstNameError}</span>
              )}
              {backendFieldErrors.firstName && (
                <span className="mt-2 block text-sm text-[#f0bbbb]">{backendFieldErrors.firstName}</span>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
                Last name
              </span>
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setBackendFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                onBlur={() => setLastNameTouched(true)}
                className="w-full rounded-xl border border-line bg-card px-4 py-3 text-[16px] text-body outline-none transition focus:border-gold"
                placeholder="Last name"
                required
              />
              {(submitted || lastNameTouched) && lastNameError && (
                <span className="mt-2 block text-sm text-[#f0bbbb]">{lastNameError}</span>
              )}
              {backendFieldErrors.lastName && (
                <span className="mt-2 block text-sm text-[#f0bbbb]">{backendFieldErrors.lastName}</span>
              )}
            </label>
          </div>

          <div className="mt-5 border-t border-gold/10" />

          <label className="mt-5 block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                updateEmail(e.target.value);
                if (!emailTouched) setEmailTouched(true);
                setBackendFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onBlur={() => setEmailTouched(true)}
              className="w-full rounded-xl border border-line bg-card px-4 py-3 text-[16px] text-body outline-none transition focus:border-gold"
              placeholder="you@company.com"
              required
            />
            {(submitted || emailTouched) && emailError && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{emailError}</span>
            )}
            {backendFieldErrors.email && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{backendFieldErrors.email}</span>
            )}
          </label>

          <div className="mt-5 border-t border-gold/10" />

          <label className="mt-5 block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
              COMMUNITY ID (OPTIONAL)
            </span>
            <p className="mb-2 text-sm leading-[1.5] text-ash">
              Optional: Enter your Community ID if one was provided to you. This helps us
              associate your account with the correct community before you use the app.
            </p>
            <input
              type="text"
              autoComplete="off"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full rounded-xl border border-line bg-card px-4 py-3 text-[16px] text-body outline-none transition focus:border-gold"
              placeholder="Enter your Community ID"
            />
            <p className="mt-2 text-sm leading-[1.5] text-muted">
              Optional on the web. Request before using the mobile app.
            </p>
          </label>

          <div className="mt-5 border-t border-gold/10" />

          <label className="mt-5 block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setBackendFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                onBlur={() => setPasswordTouched(true)}
                className="w-full rounded-xl border border-line bg-card px-4 py-3 pr-14 text-[16px] text-body outline-none transition focus:border-gold"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-muted hover:text-body"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOpenIcon className="h-[28px] w-[28px]" />
                ) : (
                  <EyeClosedIcon className="h-[28px] w-[28px]" />
                )}
              </button>
            </div>
            {(submitted || passwordTouched) && passwordError && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{passwordError}</span>
            )}
            {backendFieldErrors.password && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{backendFieldErrors.password}</span>
            )}
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
              Confirm password
            </span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setBackendFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                onBlur={() => setConfirmPasswordTouched(true)}
                className="w-full rounded-xl border border-line bg-card px-4 py-3 pr-14 text-[16px] text-body outline-none transition focus:border-gold"
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-muted hover:text-body"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOpenIcon className="h-[28px] w-[28px]" />
                ) : (
                  <EyeClosedIcon className="h-[28px] w-[28px]" />
                )}
              </button>
            </div>
            {(submitted || confirmPasswordTouched) && confirmPasswordError && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{confirmPasswordError}</span>
            )}
            {backendFieldErrors.confirmPassword && (
              <span className="mt-2 block text-sm text-[#f0bbbb]">{backendFieldErrors.confirmPassword}</span>
            )}
          </label>

          {selectedLabel && (
            <p className="mt-5 text-sm text-muted">
              Selected plan: <span className="text-body">{selectedLabel}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex h-10 w-full max-w-[280px] items-center justify-center rounded-full bg-gold-cta px-5 font-sans text-[14px] font-semibold text-[#15110A] transition hover:bg-gold-hi disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:ml-auto sm:h-12 sm:w-auto sm:max-w-none sm:px-7 sm:text-[16px]"
              disabled={!hasProduct || !formValid || isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Send Verification Code"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/paywall")}
              className="inline-flex h-10 w-full max-w-[280px] items-center justify-center rounded-full border border-line bg-card px-5 font-sans text-[14px] font-semibold text-body transition hover:border-gold sm:order-1 sm:h-12 sm:w-auto sm:max-w-none sm:px-6 sm:text-[15px]"
            >
              Back to plans
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
