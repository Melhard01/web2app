"use client";

import type { ReactNode } from "react";
import { QRCode } from "./QRCode";
import { Arrow } from "@/components/ui/Button";
import { AndroidIcon, AppleIcon, CheckIcon } from "@/components/ui/icons";
import { STORES } from "@/lib/config";
import type { ProvisionResult } from "@/lib/provision";

/**
 * Handoff — the end of the web path. Two platform sections (Android & iOS),
 * each with the store QR, a copy field, and the platform logo. The entitlement
 * is bound to the buyer's email, so after installing and signing in the app
 * restores their plan with no second charge (the "already installed?" link uses
 * the signed deep-link token for instant unlock).
 */
export function MultiRailHandoff({ result }: { result: ProvisionResult }) {
  const { handoff: links, email, plan, tier, interval, addon } = result;

  return (
    <div className="flex flex-col gap-8 overflow-x-hidden animate-rise">
      <header className="mx-auto w-full max-w-md px-1 text-center">
        <div className="relative mx-auto h-16 w-16">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gold text-[#15110A] shadow-[0_0_44px_rgba(201,162,75,0.45)]">
            <CheckIcon className="h-8 w-8" />
          </span>
        </div>
        <h1 className="mt-6 font-display text-[clamp(30px,6vw,44px)] font-semibold leading-none text-white">
          You’re in
        </h1>
        <p className="mt-4 break-words text-[15px] leading-[1.55] text-ash">
          Your membership is active. Install the app and sign in with{" "}
          <span className="break-all text-white">{email}</span> — you won’t be charged again.
        </p>
        <p className="mt-4 inline-block max-w-full break-words rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] leading-[1.4] text-gold-hi sm:px-3.5 sm:text-[11.5px]">
          {plan} · {tier} · billed {interval === "year" ? "yearly" : "monthly"}
          {addon ? " · + Custom Brain Booster" : ""}
        </p>
      </header>

      {/* Activation guide — the mental model before the store actions. */}
      <section className="rounded-[18px] border border-gold/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.02)_100%)] p-4 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.16),0_14px_36px_rgba(0,0,0,0.5)] sm:p-5 lg:p-6">
        <p className="lab mb-3 sm:mb-4">What happens next</p>
        <ol className="flex flex-col gap-3 sm:gap-4">
          <NextStep
            n={1}
            title="Install the app"
            body="Scan a QR code below, or tap your app store."
          />
          <NextStep
            n={2}
            title={
              <>
                Sign in with <span className="break-all text-white">{email}</span>
              </>
            }
            body="Use the same email you checked out with."
          />
          <NextStep
            n={3}
            title="Your membership unlocks"
            body={`Your ${tier} plan activates automatically — you won’t be charged again.`}
          />
        </ol>
      </section>

      <p className="text-center">
        <span className="inline-block rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-label text-muted">
          Scan or tap to install on your phone
        </span>
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <StoreSection
          icon={<AndroidIcon className="h-5 w-5" />}
          platform={STORES.android.platform}
          url={STORES.android.url}
          cta="Get it on Google Play"
        />
        <StoreSection
          icon={<AppleIcon className="h-5 w-5" />}
          platform={STORES.ios.platform}
          url={STORES.ios.url}
          cta="Download on the App Store"
        />
      </div>

      <div className="text-center">
        <a
          href={links.deepLink}
          className="text-sm text-gold-hi underline underline-offset-2"
        >
          Already installed? Open the app directly
        </a>
      </div>
    </div>
  );
}

function NextStep({
  n,
  title,
  body,
}: {
  n: number;
  title: ReactNode;
  body: string;
}) {
  return (
    <li className="flex gap-2.5 sm:gap-3.5">
      <span className="grid h-5 w-5 flex-none place-items-center rounded-full border border-gold/50 bg-gold/10 font-mono text-[10px] text-gold-hi sm:h-6 sm:w-6 sm:text-[11px]">
        {n}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[14px] font-semibold leading-[1.4] text-white sm:text-[15px]">{title}</p>
        <p className="m-0 mt-0.5 text-[12.5px] leading-[1.5] text-ash sm:text-[13.5px]">{body}</p>
      </div>
    </li>
  );
}

function StoreSection({
  icon,
  platform,
  url,
  cta,
}: {
  icon: React.ReactNode;
  platform: string;
  url: string;
  cta: string;
}) {
  return (
    <section className="flex min-h-[430px] flex-col items-center gap-4 rounded-[2px] border border-gold/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.02)_100%)] px-5 pb-5 pt-14 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.16),0_14px_36px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-gold/30 bg-[#0A0A0A] text-paper">
          {icon}
        </span>
        <span className="font-display text-[20px] font-semibold text-white">
          {platform}
        </span>
      </div>

      <div className="rounded-[2px] bg-paper p-3">
        <QRCode value={url} size={160} />
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[6px] bg-gold-cta px-4 py-2.5 text-[14px] font-semibold text-[#15110A] transition hover:bg-gold-hi"
      >
        {cta} <Arrow />
      </a>
    </section>
  );
}
