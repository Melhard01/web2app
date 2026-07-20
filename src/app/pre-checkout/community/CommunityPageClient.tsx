"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandHeader } from "@/components/ui/BrandHeader";

const COMMUNITY_ID_STORAGE_KEY = "epiminded.communityId.v1";

export function CommunityPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = searchParams.get("products") ?? "";
  const [communityId, setCommunityId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(COMMUNITY_ID_STORAGE_KEY);
      if (typeof stored === "string" && stored.trim()) {
        setCommunityId(stored.trim());
      }
    } catch {
      // non-fatal session storage issue
    }
  }, []);

  const cleaned = communityId.trim();
  const error = submitted && !cleaned ? "Community ID is required." : "";

  const buildFormUrl = () => {
    const params = new URLSearchParams();
    if (products) params.set("products", products);
    const query = params.toString();
    return query ? `/pre-checkout?${query}` : "/pre-checkout";
  };

  const continueToForm = (value: string) => {
    const cleanedValue = value.trim();
    try {
      sessionStorage.setItem(COMMUNITY_ID_STORAGE_KEY, cleanedValue);
    } catch {
      // non-fatal session storage issue
    }
    router.push(buildFormUrl());
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!communityId.trim()) return;
    continueToForm(communityId);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={1} />
      <main className="mx-auto w-full max-w-[900px] px-8 pb-20 pt-12 sm:px-12 sm:pt-16">
        <div className="mb-6 flex justify-center">
          <span className="inline-block rounded-full border border-gold/40 px-5 py-2 font-mono text-[12px] uppercase tracking-eyebrow text-gold">
            Step 2 · Community
          </span>
        </div>

        <h1 className="m-0 mb-4 font-display text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
          Link your community
        </h1>
        <p className="m-0 mb-8 max-w-[40em] text-[17px] leading-[1.6] text-ash">
          Activating the mobile app requires a Community ID, issued by your community admin or the
          person who referred you. If you don&apos;t have one, check with them before
          subscribing.
        </p>

        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-gold/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.02)_100%)] p-8 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.16),0_14px_36px_rgba(0,0,0,0.5)] sm:p-10"
        >
          <label className="block">
            <span className="mb-2 block font-mono text-[12px] uppercase tracking-label text-muted">
              COMMUNITY ID
            </span>
            <p className="mb-2 text-sm leading-[1.5] text-ash">
              Enter the Community ID that was provided to you. This links your account to the
              correct community before you use the app.
            </p>
            <input
              type="text"
              autoComplete="off"
              required
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full rounded-xl border border-line bg-card px-4 py-3 text-[16px] text-body outline-none transition focus:border-gold"
              placeholder="Enter your Community ID"
            />
            {error ? <span className="mt-2 block text-sm text-[#f0bbbb]">{error}</span> : null}
            <p className="mt-2 text-sm leading-[1.5] text-muted">
              Required before creating your account.
            </p>
          </label>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={!cleaned}
              className="inline-flex h-10 w-full max-w-[280px] items-center justify-center rounded-full bg-gold-cta px-5 font-sans text-[14px] font-semibold text-[#15110A] transition hover:bg-gold-hi disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:ml-auto sm:h-12 sm:w-auto sm:max-w-none sm:px-7 sm:text-[16px]"
            >
              Continue
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
